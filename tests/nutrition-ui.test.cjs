const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const root = process.env.CHEBUFIT_BUILD;
const n = require(path.join(root, 'features/nutrition/index.js'));
const p = require(path.join(root, 'features/nutrition/model/diaryPresentation.js'));
const { nutritionFormatters } = require(path.join(root, 'features/nutrition/model/messages.js'));
const { createKeyValueNutritionRepository } = require(path.join(root, 'infrastructure/nutrition/KeyValueNutritionRepository.js'));
const day = '2026-10-18', stamp = '2026-10-18T12:00:00Z';
const ok = r => { assert.equal(r.ok, true, JSON.stringify(r)); return r.value; };
let count = 0;
function fixture() {
  const data = new Map(); let fail = false, writes = 0;
  const storage = { async getItem(k) { return data.get(k) ?? null; }, async setItem(k, v) { if (fail) throw Error('disk'); writes++; data.set(k, v); } };
  const repository = { ...createKeyValueNutritionRepository(storage, 'developmentDemo'), identity: 'diary-ui-' + ++count };
  const service = () => n.createNutritionService(repository, { now: () => stamp, nextId: () => 'new-entry' });
  return { service, data, fail: value => { fail = value; }, get writes() { return writes; } };
}
test('selected-day projection has four meals, stable entry identities, snapshot quantities and domain calorie totals', async () => {
  const f = fixture(), view = ok(await f.service().getDay(day)), meals = p.toDiaryMeals(view);
  assert.deepEqual(meals.map(m => m.meal), ['breakfast','lunch','dinner','snacks']);
  assert.equal(meals.flatMap(m => m.entries).length, 11);
  for (const meal of meals) {
    assert.equal(Math.round(meal.entries.reduce((sum, row) => sum + row.calories * 100, 0)), view.summary.meals[meal.meal].energyCentiKcal);
    for (const row of meal.entries) {
      assert.equal(row.entry.id, view.diary.entries.find(e => e.id === row.entry.id).id);
      assert.equal(row.grams, row.entry.quantity.milliGrams / 1000);
      assert.equal(row.calories, ok(n.entryNutrition(row.entry)).energyCentiKcal / 100);
    }
  }
  const overview = n.toNutritionOverview(view);
  assert.equal(overview.calories.consumed, Math.round(view.summary.totals.energyCentiKcal / 100));
  assert.deepEqual(overview.macros.map(m => m.consumed), [128,47,241]);
});
test('previous/next/today date identities are explicit and deterministic across leap/year boundaries', () => {
  assert.equal(p.shiftDiaryDate(day, -1), '2026-10-17');
  assert.equal(p.shiftDiaryDate(p.shiftDiaryDate(day, -1), 1), day);
  assert.equal(p.shiftDiaryDate('2028-03-01', -1), '2028-02-29');
  assert.equal(p.shiftDiaryDate('2026-12-31', 1), '2027-01-01');
  const format = nutritionFormatters('ru');
  assert.equal(format.date(day, day), 'Сегодня, 18 октября');
  assert.equal(format.date('2026-10-17', day), 'Вчера, 17 октября');
  assert.equal(format.date('2026-10-16', day), '16 октября');
});
test('read-only historical/future browsing neither creates records nor consumes development seed', async () => {
  const f = fixture();
  for (const date of ['2026-10-17', '2026-10-19']) assert.equal(ok(await f.service().getDay(date, { readOnly: true })).diary.entries.length, 0);
  assert.equal(f.writes, 0);
  assert.equal(ok(await f.service().getDay(day)).diary.entries.length, 11);
  const before = f.writes;
  ok(await f.service().getDay('2026-10-17', { readOnly: true }));
  assert.equal(f.writes, before);
  assert.deepEqual(ok(await f.service().getHistory('2026-01-01','2026-12-31')).map(d => d.localDate), [day]);
});
test('Add Food routes preserve each selected meal and local date; malformed/ambiguous/future params fail closed', () => {
  for (const meal of n.mealTypes) {
    const route = p.addFoodRoute('2026-10-17', meal);
    assert.equal(route.pathname, '/add-food');
    assert.deepEqual(p.parseAddFoodContext(route.params, day), { date: '2026-10-17', meal });
  }
  for (const params of [{}, {date:day,meal:'Завтрак'}, {date:['2026-10-18'],meal:'lunch'}, {date:'2026-02-30',meal:'lunch'}, {date:'2026-10-19',meal:'lunch'}]) assert.equal(p.parseAddFoodContext(params, day), null);
});
test('quantity draft supports Russian decimals, rejects invalid/zero/negative/excess precision without a write', () => {
  for (const text of ['', '0', '-1', '0,000', 'abc', '1e3', '1.2345', 'Infinity', '1,']) assert.equal(p.parseQuantityDraft(text), null);
  assert.equal(p.parseQuantityDraft('150'), 150);
  assert.equal(p.parseQuantityDraft(' 150,5 '), 150.5);
  assert.equal(p.parseQuantityDraft('0.001'), 0.001);
});
test('combined quantity and meal edit commits once, preserves snapshot/identity, and survives reload', async () => {
  const f = fixture(), original = ok(await f.service().getDay(day)), entry = original.diary.entries[0], writes = f.writes;
  const changed = ok(await f.service().updateEntryDetails(day, entry.id, { quantityGrams: 150, meal: 'lunch' }));
  assert.equal(f.writes, writes + 1); assert.equal(changed.fact, null);
  assert.equal(changed.entry.id, entry.id); assert.equal(changed.entry.createdAt, entry.createdAt);
  assert.deepEqual(changed.entry.food, entry.food); assert.equal(changed.entry.quantity.milliGrams, 150000); assert.equal(changed.entry.meal, 'lunch');
  assert.deepEqual(changed.view.diary.entries.filter(e => e.id !== entry.id), original.diary.entries.filter(e => e.id !== entry.id));
  assert.deepEqual(ok(await f.service().getDay(day)), changed.view);
  assert.deepEqual(changed.view.summary, ok(n.calculateNutritionSummary(changed.view.diary.entries, changed.view.targets)));
});
test('failed/invalid combined edit cannot partially commit quantity or meal and publishes no successful change', async () => {
  const f = fixture(), before = ok(await f.service().getDay(day)), entry = before.diary.entries[0]; let notifications = 0;
  const unsubscribe = f.service().subscribe(() => notifications++);
  assert.equal((await f.service().updateEntryDetails(day, entry.id, {quantityGrams:0,meal:'lunch'})).ok, false);
  assert.equal((await f.service().updateEntryDetails(day, entry.id, {quantityGrams:150,meal:'invalid'})).ok, false);
  f.fail(true); assert.equal((await f.service().updateEntryDetails(day, entry.id, {quantityGrams:150,meal:'lunch'})).error, 'storageUnavailable');
  assert.equal(notifications, 0); f.fail(false); assert.deepEqual(ok(await f.service().getDay(day)), before); unsubscribe();
});
test('seed deletion persists and does not regenerate; history and summary remain authoritative without reward facts', async () => {
  const f = fixture(), original = ok(await f.service().getDay(day)), entry = original.diary.entries[0];
  const deleted = ok(await f.service().deleteEntry(day, entry.id));
  assert.equal(deleted.fact, null); assert.equal(deleted.view.diary.entries.length,10);
  assert.deepEqual(ok(await f.service().getDay(day)),deleted.view);
  assert.equal(ok(await f.service().getDay('2026-10-17',{readOnly:true})).diary.entries.length,0);
  assert.deepEqual(ok(await f.service().getDay(day)),deleted.view);
});
test('combined edit and simultaneous add preserve both changes through the shared serialization boundary', async () => {
  const f = fixture(), view = ok(await f.service().getDay(day)), entry = view.diary.entries[0];
  const results = await Promise.all([
    f.service().updateEntryDetails(day, entry.id, {quantityGrams: 150, meal:'lunch'}),
    f.service().addEntry({localDate:day,meal:'breakfast',food:entry.food,quantityGrams:100}),
  ]);
  results.forEach(ok);
  const reloaded = ok(await f.service().getDay(day));
  assert.equal(reloaded.diary.entries.length,12);
  assert.equal(reloaded.diary.entries.find(e=>e.id===entry.id).meal,'lunch');
  assert.equal(reloaded.diary.entries.find(e=>e.id===entry.id).quantity.milliGrams,150000);
  assert.equal(reloaded.diary.entries.find(e=>e.id==='new-entry').quantity.milliGrams,100000);
});

test('calorie summary neutrally distinguishes remaining, exact target and positive overage using canonical precision', async () => {
  const view = ok(await fixture().service().getDay(day));
  for (const [consumed, kind, expected] of [[194000,'remaining',90500],[284500,'remaining',0],[311100,'overTarget',26600],[284501,'overTarget',1]]) {
    const selected = { ...view, summary: { ...view.summary, totals: { ...view.summary.totals, energyCentiKcal: consumed } } };
    const before = JSON.stringify(selected);
    assert.deepEqual(p.calorieGoalStatus(selected), { kind, energyCentiKcal: expected });
    assert.equal(JSON.stringify(selected), before);
  }
});
