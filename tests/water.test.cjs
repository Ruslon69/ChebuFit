const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const root = process.env.CHEBUFIT_BUILD;
const { createWaterService, createInitialWaterState, decodeWaterState, changeWater } = require(path.join(root, 'features/water/index.js'));
const { createKeyValueWaterRepository } = require(path.join(root, 'infrastructure/water/KeyValueWaterRepository.js'));
const { createOrangeWalletService, createOrangeRewardNotice } = require(path.join(root, 'features/rewards/index.js'));
const { createKeyValueOrangeWalletRepository } = require(process.env.CHEBUFIT_WALLET_ADAPTER_BUILD);
const { rewardWaterGoalReached } = require(path.join(root, 'application/rewards/waterGoalRewards.js'));
const { getLocalDateKey, isLocalDateKey } = require(path.join(root, 'shared/utils/localCalendar.js'));
const { createTodayFormatters } = require(path.join(root, 'features/today/model/messages.js'));
const day = '2026-10-18', nextDay = '2026-10-19', now = '2026-10-18T23:30:00-03:00';
const ok = result => { assert.equal(result.ok, true, JSON.stringify(result)); return result.value; };
let fixtureId = 0;
function fixture(mode = 'real') {
  const data = new Map(), identity = 'test-water-'+(++fixtureId); let failRead = false, failWrite = false, writes = 0;
  const storage = {
    async getItem(key) { if (failRead) throw Error('read'); return data.get(key) ?? null; },
    async setItem(key, value) { if (failWrite) throw Error('write'); writes++; data.set(key, value); },
  };
  const repository = () => ({ ...createKeyValueWaterRepository(storage, mode), identity });
  const service = () => createWaterService(repository(), { now: () => now, allowDevelopmentReset: true });
  return { service, repository, data, storage, key: `@chebufit/water/${mode}`, failRead: value => { failRead = value; }, failWrite: value => { failWrite = value; }, get writes() { return writes; } };
}

test('A/C: new real day persists zero and the 2500 ml goal, no crossing on read', async () => {
  const f = fixture();
  assert.equal(ok(await f.service().getDefaultGoal()), 2500);
  const record = ok(await f.service().getDay(day));
  assert.deepEqual(record, { localDate: day, consumedMl: 0, goalMl: 2500, createdAt: now, updatedAt: now });
  assert.equal(Object.hasOwn(record, 'crossedGoal'), false);
  assert.equal(JSON.parse(f.data.get(f.key)).schemaVersion, 1);
});
test('B: demo opening is explicitly marked, applied once to one day, never fabricates history', async () => {
  const f = fixture('developmentDemo'), service = f.service();
  assert.equal(ok(await service.getDay(day)).consumedMl, 1500);
  assert.equal(ok(await f.service().getDay(day)).consumedMl, 1500);
  assert.equal(ok(await service.getDay(nextDay)).consumedMl, 0);
  const state = ok(await f.repository().load());
  assert.deepEqual(state.demoSeed, { amountMl: 1500, localDate: day });
  assert.equal(state.dailyRecords.length, 2);
  assert.equal(ok(await service.getHistory('2026-10-01', '2026-10-17')).length, 0);
});
test('D/E/F: sequential +250 writes survive repository/service reload', async () => {
  const f = fixture();
  assert.equal(ok(await f.service().addWater(250, day)).record.consumedMl, 250);
  assert.equal(ok(await f.service().getDay(day)).consumedMl, 250);
  assert.equal(ok(await f.service().addWater(250, day)).record.consumedMl, 500);
  assert.equal(ok(await f.repository().load()).dailyRecords[0].consumedMl, 500);
});
test('G: concurrent adds across service instances preserve every update and one goal crossing', async () => {
  const f = fixture();
  const results = await Promise.all(Array.from({ length: 20 }, () => f.service().addWater(250, day)));
  assert.equal(ok(await f.service().getDay(day)).consumedMl, 5000);
  assert.equal(results.filter(result => ok(result).crossedGoal).length, 1);
  assert.deepEqual(results.map(result => ok(result).record.consumedMl), Array.from({ length: 20 }, (_, i) => (i+1)*250));
});
test('H/I/O/P/Q: 2250 → 2500 crosses once; 2500 → 2750 → 3000 stays valid, reads never emit facts', async () => {
  const f = fixture(), service = f.service();
  assert.equal(ok(await service.addWater(2250, day)).crossedGoal, false);
  assert.equal(ok(await service.addWater(250, day)).crossedGoal, true);
  assert.equal(ok(await f.service().getDay(day)).consumedMl, 2500);
  const above = ok(await service.addWater(250, day));
  assert.equal(above.record.consumedMl, 2750); assert.equal(above.crossedGoal, false);
  const more = ok(await service.addWater(250, day));
  assert.equal(more.record.consumedMl, 3000); assert.equal(more.crossedGoal, false);
});
test('K/L/M: zero, negative, fractional, nonfinite and unsafe adds/removes are rejected without writing', async () => {
  const f = fixture(); ok(await f.service().getDay(day)); const writes = f.writes;
  for (const amount of [-250, 0, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER+1]) {
    assert.deepEqual(await f.service().addWater(amount, day), { ok: false, error: 'invalidAmount' });
    assert.deepEqual(await f.service().removeWater(amount, day), { ok: false, error: 'invalidAmount' });
  }
  assert.equal(f.writes, writes);
});
test('N: corrections persist, clamp to zero, and do not emit goal crossings', async () => {
  const f = fixture(); ok(await f.service().addWater(2750, day));
  const corrected = ok(await f.service().removeWater(750, day));
  assert.equal(corrected.record.consumedMl, 2000); assert.equal(corrected.crossedGoal, false);
  assert.equal(ok(await f.service().getDay(day)).consumedMl, 2000);
  assert.equal(ok(await f.service().removeWater(5000, day)).record.consumedMl, 0);
});
test('R: saved water → approved reward bundle; correction/re-cross and reload cannot farm rewards', async () => {
  const f = fixture(), water = f.service();
  const wallet = createOrangeWalletService(createKeyValueOrangeWalletRepository(f.storage, 'developmentDemo'), { now: () => now });
  const context = { localDay: day, occurredAt: now };
  const add = async (amount, localDate = day) => {
    const changed = ok(await water.addWater(amount, localDate));
    return changed.crossedGoal ? rewardWaterGoalReached(wallet, { ...context, localDay: localDate }) : null;
  };
  assert.equal(await add(2250), null);
  assert.equal(ok(await wallet.loadWallet()).balance, 248);
  const first = await add(250);
  assert.equal(ok(first).amount, 17); assert.equal(createOrangeRewardNotice(first, 'first').kind, 'celebration');
  assert.equal(ok(await wallet.loadWallet()).balance, 265);
  assert.equal(await add(250), null);
  ok(await water.removeWater(750, day));
  assert.equal(await add(250), null);
  const repeat = await add(250); assert.equal(ok(repeat).amount, 0); assert.equal(createOrangeRewardNotice(repeat, 'repeat'), null);
  assert.equal(ok(await f.service().getDay(day)).consumedMl, 2500);
  assert.equal(ok(await wallet.loadWallet()).balance, 265);
  assert.equal(ok(await add(2500, nextDay)).amount, 7);
});
test('S/T/U/V: new local days start zero, preserve history and snapshot current default goal', async () => {
  const f = fixture(), service = f.service();
  ok(await service.addWater(2750, day));
  assert.equal(ok(await service.setDefaultGoal(3000)), 3000);
  assert.equal(ok(await f.service().getDefaultGoal()), 3000);
  assert.equal(ok(await service.getDay(day)).goalMl, 2500);
  assert.deepEqual(ok(await service.getDay(nextDay)), { localDate: nextDay, consumedMl: 0, goalMl: 3000, createdAt: now, updatedAt: now });
  const history = ok(await service.getHistory(day, nextDay));
  assert.deepEqual(history.map(r => [r.localDate, r.consumedMl, r.goalMl]), [[day,2750,2500],[nextDay,0,3000]]);
  assert.equal(ok(await service.getHistory(day, day)).length, 1);
  assert.equal(ok(await service.getHistory('2026-10-01', '2026-10-07')).length, 0, 'history reads do not fabricate empty days');
});
test('W/X: corrupt JSON and incompatible schemas are preserved, never silently reset', async () => {
  const f = fixture();
  for (const [raw, error] of [['broken', 'corruptData'], ['null','corruptData'], [JSON.stringify({schemaVersion:2}), 'unsupportedSchema']]) {
    f.data.set(f.key, raw);
    assert.deepEqual(await f.service().getDay(day), { ok:false,error });
    assert.deepEqual(await f.service().addWater(250, day), { ok:false,error });
    assert.equal(f.data.get(f.key),raw);
  }
});
test('schema rejects negative/fractional quantities, invalid goals/dates/metadata, duplicates, and seed/mode confusion', async () => {
  const f = fixture(); ok(await f.service().getDay(day)); const baseline = JSON.parse(f.data.get(f.key));
  const corruptions = [
    s => {s.dailyRecords[0].consumedMl=-1;}, s => {s.dailyRecords[0].consumedMl=2.5;},
    s => {s.dailyRecords[0].consumedMl=Number.MAX_SAFE_INTEGER+1;}, s => {s.dailyRecords[0].goalMl=0;},
    s => {s.defaultGoalMl=2.5;}, s => {s.defaultGoalMl=-10;}, s => {s.dailyRecords[0].localDate='2026-02-30';},
    s => {s.dailyRecords[0].createdAt='bad';}, s => {s.dailyRecords[0].updatedAt='2000-01-01T00:00:00Z';},
    s => {s.dailyRecords.push(s.dailyRecords[0]);}, s => {s.mode='developmentDemo';},
    s => {s.demoSeed={amountMl:1500,localDate:day};},
  ];
  for (const corrupt of corruptions) {
    const value = structuredClone(baseline);corrupt(value);
    assert.equal(decodeWaterState(value,'real').ok,false);
    f.data.set(f.key,JSON.stringify(value));assert.equal((await f.service().getDay(day)).ok,false);
  }
});
test('invalid goals/dates/ranges are rejected without writes; day identity is explicit across UTC/year boundaries', async () => {
  const f = fixture();
  for (const goal of [-1,0,2.5,Infinity]) assert.equal((await f.service().setDefaultGoal(goal)).error,'invalidGoal');
  for (const invalid of ['2026-02-30','2026-13-01','2026-1-1','0000-01-01']) assert.equal((await f.service().getDay(invalid)).error,'invalidLocalDate');
  assert.equal((await f.service().getHistory(nextDay,day)).error,'invalidLocalDate');assert.equal(f.writes,0);
  assert.equal(isLocalDateKey('2028-02-29'),true);assert.equal(isLocalDateKey('2027-02-29'),false);
  assert.equal(getLocalDateKey(new Date(2026,9,18,0,1)),day);
  assert.equal(ok(await f.service().addWater(250,'2026-12-31')).record.localDate,'2026-12-31');
  assert.equal(ok(await f.service().getDay('2027-01-01')).consumedMl,0);
});
test('failure publishes no unsaved amount/crossing; retry queue recovers and invalid state is never replaced', async () => {
  const f = fixture(), service = f.service();ok(await service.addWater(2250,day));
  const published=[],unsubscribe=service.subscribe(r=>published.push(r));f.failWrite(true);
  assert.deepEqual(await service.addWater(250,day),{ok:false,error:'storageUnavailable'});assert.deepEqual(published,[]);
  f.failWrite(false);assert.equal(ok(await f.service().getDay(day)).consumedMl,2250);
  assert.equal(ok(await service.addWater(250,day)).crossedGoal,true);unsubscribe();
  f.failRead(true);assert.equal((await service.addWater(250,day)).error,'storageUnavailable');f.failRead(false);
  assert.equal(ok(await service.getDay(day)).consumedMl,2500);
});
test('safe-integer overflow and backwards clocks do not corrupt water state', async () => {
  const f = fixture();ok(await f.service().addWater(Number.MAX_SAFE_INTEGER,day));
  assert.equal((await f.service().addWater(1,day)).error,'amountOverflow');
  assert.equal(ok(await f.service().getDay(day)).consumedMl,Number.MAX_SAFE_INTEGER);
  const record={localDate:day,consumedMl:250,goalMl:2500,createdAt:now,updatedAt:now};
  assert.equal(ok(changeWater(record,250,'add','2000-01-01T00:00:00Z')).record.updatedAt,now);
});
test('development reset is isolated and explicit; normal reads never reseed a corrected demo day', async () => {
  const f = fixture('developmentDemo');ok(await f.service().getDay(day));ok(await f.service().removeWater(1500,day));
  assert.equal(ok(await f.service().getDay(day)).consumedMl,0);
  ok(await f.service().getDay(nextDay));assert.equal(ok(await f.service().resetForDevelopment(day)).consumedMl,1500);
  assert.equal(ok(await f.service().getHistory(day,nextDay)).length,1);
  assert.equal((await fixture().service().resetForDevelopment(day)).error,'resetDisabled');
  assert.equal((await createWaterService(f.repository(),{now:()=>now}).resetForDevelopment(day)).error,'resetDisabled');
});
test('integer ml persistence and polished Russian liters never store floating-point liters', async () => {
  const f=fixture();ok(await f.service().addWater(2750,day));
  const state=JSON.parse(f.data.get(f.key));assert.equal(Number.isInteger(state.dailyRecords[0].consumedMl),true);
  assert.equal(Object.hasOwn(state.dailyRecords[0],'litres'),false);
  const format=createTodayFormatters('ru');assert.equal(format.number(2750/1000),'2,75');assert.equal(format.number(2500/1000),'2,5');
});
