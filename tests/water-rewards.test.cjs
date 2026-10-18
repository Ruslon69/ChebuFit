const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const { createOrangeWalletService, createOrangeRewardNotice } = require(path.join(process.env.CHEBUFIT_REWARDS_BUILD, 'index.js'));
const { createKeyValueOrangeWalletRepository } = require(process.env.CHEBUFIT_WALLET_ADAPTER_BUILD);
const { rewardWaterGoalReached } = require(path.join(process.env.CHEBUFIT_BUILD, 'application/rewards/waterGoalRewards.js'));
const { createLocalRewardContext } = require(path.join(process.env.CHEBUFIT_BUILD, 'application/rewards/localRewardContext.js'));
const { changeWater } = require(path.join(process.env.CHEBUFIT_BUILD, 'features/water/index.js'));
function addWaterPortion(consumedMl, goalMl, portionMl) {
  const timestamp = '2026-10-17T12:00:00Z';
  const result = changeWater({ consumedMl, goalMl, localDate: '2026-10-17', createdAt: timestamp, updatedAt: timestamp }, portionMl, 'add', timestamp);
  return result.ok ? { consumedMl: result.value.record.consumedMl, goalReached: result.value.crossedGoal } : { consumedMl, goalReached: false };
}
const { getRewardMessages } = require(path.join(process.env.CHEBUFIT_REWARDS_BUILD, 'model/rewardMessages.js'));

const context = { localDay: '2026-10-17', occurredAt: '2026-10-17T23:30:00-03:00' };
const ok = result => { assert.equal(result.ok, true, JSON.stringify(result)); return result.value; };
function fixture(mode = 'developmentDemo') {
  const data = new Map(); let writes = 0, fail = false;
  const storage = {
    async getItem(key) { return data.get(key) ?? null; },
    async setItem(key, value) { if (fail) throw Error('save failed'); writes++; data.set(key, value); },
  };
  const service = () => createOrangeWalletService(createKeyValueOrangeWalletRepository(storage, mode), { now: () => '2026-10-19T12:00:00Z', allowDevelopmentReset: true });
  return { service, get writes() { return writes; }, fail(value) { fail = value; } };
}
async function establish(service) {
  const base = { localDay: '2026-10-16', occurredAt: '2026-10-16T12:00:00+02:00' };
  ok(await service.processRewardEvent({ ...base, type: 'mealLogged', eventId: 'old-meal' }));
  ok(await service.processRewardEvent({ ...base, type: 'welcomeReward', eventId: 'welcome', qualifyingEventId: 'old-meal' }));
}

test('A/B: demo starts 248; portions below goal never emit a goal fact or process rewards', async () => {
  const f = fixture(), service = f.service();
  assert.equal(ok(await service.loadWallet()).balance, 248);
  let amount = 1500, facts = 0;
  for (let i = 0; i < 3; i++) {
    const next = addWaterPortion(amount, 2500, 250); amount = next.consumedMl;
    if (next.goalReached) { facts++; await rewardWaterGoalReached(service, context); }
  }
  assert.equal(amount, 2250);
  assert.equal(facts, 0);
  assert.equal(ok(await service.loadWallet()).balance, 248);
});

test('C–G/P/Q: goal transition commits 2 + 5 + 10 in order, one save, one notice, wallet 265', async () => {
  const f = fixture(), service = f.service();
  ok(await service.loadWallet());
  const writes = f.writes, snapshots = [];
  const unsubscribe = service.subscribe(wallet => snapshots.push(wallet.balance));
  const transition = addWaterPortion(2250, 2500, 250);
  assert.deepEqual(transition, { consumedMl: 2500, goalReached: true });
  const batch = await rewardWaterGoalReached(service, context);
  const value = ok(batch);
  assert.deepEqual(value.results.map(result => result.amount), [2, 5, 10]);
  assert.deepEqual(value.wallet.state.ledger.map(entry => entry.grant.eventType), ['waterGoalCompleted', 'activeDayQualified', 'welcomeReward']);
  assert.equal(value.amount, 17);
  assert.equal(value.wallet.balance, 265);
  assert.equal(f.writes - writes, 1);
  assert.deepEqual(snapshots, [265], 'one published committed balance, no partial updates');
  const notice = createOrangeRewardNotice(batch, 'goal');
  assert.deepEqual(notice, { id: 'goal', amount: 17, includesWelcome: true, kind: 'celebration' });
  assert.equal(notice.amount, value.wallet.balance - 248);
  unsubscribe();
  assert.deepEqual(addWaterPortion(2500, 2500, 250), { consumedMl: 2750, goalReached: false });
});

test('H: established wallet earns only 7, relative to its actual starting balance', async () => {
  const f = fixture(), service = f.service(); await establish(service);
  const before = ok(await service.loadWallet()).balance;
  const batch = await rewardWaterGoalReached(service, context);
  assert.equal(ok(batch).amount, 7);
  assert.equal(ok(batch).wallet.balance, before + 7);
  assert.equal(createOrangeRewardNotice(batch, 'goal').includesWelcome, false);
});

test('I: active day already granted from food; water action earns only 2 for established wallet', async () => {
  const f = fixture(), service = f.service(); await establish(service);
  ok(await service.processRewardEvent({ ...context, type: 'activeDayQualified', category: 'foodTracking', sourceId: 'food-entry', eventId: 'food-active' }));
  const batch = await rewardWaterGoalReached(service, context);
  assert.equal(ok(batch).amount, 2);
  assert.equal(createOrangeRewardNotice(batch, 'goal').amount, 2);
});

test('J/K/L/M: replay after reload grants nothing and produces no feedback or storage write', async () => {
  const f = fixture();
  await rewardWaterGoalReached(f.service(), context);
  assert.equal(ok(await f.service().loadWallet()).balance, 265);
  const writes = f.writes;
  const replay = await rewardWaterGoalReached(f.service(), context);
  assert.equal(ok(replay).amount, 0);
  assert.equal(ok(replay).wallet.state.ledger.length, 3);
  assert.equal(createOrangeRewardNotice(replay, 'replay'), null);
  assert.equal(f.writes, writes);
});

test('N: next supplied local day earns water + active day again, never another welcome', async () => {
  const f = fixture(); await rewardWaterGoalReached(f.service(), context);
  const next = await rewardWaterGoalReached(f.service(), { localDay: '2026-10-18', occurredAt: '2026-10-18T00:15:00+14:00' });
  assert.equal(ok(next).amount, 7);
  assert.equal(ok(next).wallet.balance, 272);
  assert.equal(ok(next).wallet.state.ledger.filter(entry => entry.grant.eventType === 'welcomeReward').length, 1);
});

test('O: save failure commits no partial grant, emits no balance update, and cannot produce feedback', async () => {
  const f = fixture(), service = f.service(); ok(await service.loadWallet());
  const snapshots = [], unsubscribe = service.subscribe(wallet => snapshots.push(wallet));
  f.fail(true);
  const failed = await rewardWaterGoalReached(service, context);
  assert.deepEqual(failed, { ok: false, error: 'storageUnavailable' });
  assert.equal(createOrangeRewardNotice(failed, 'failed'), null);
  assert.deepEqual(snapshots, []);
  f.fail(false); unsubscribe();
  const wallet = ok(await f.service().loadWallet());
  assert.equal(wallet.balance, 248);
  assert.deepEqual(wallet.state.ledger, []);
  assert.equal(ok(await rewardWaterGoalReached(service, context)).amount, 17, 'retry can earn the entire bundle');
});

test('P: concurrent repeated goal facts produce at most one aggregated positive result', async () => {
  const f = fixture();
  const results = await Promise.all(Array.from({ length: 10 }, () => rewardWaterGoalReached(f.service(), context)));
  const notices = results.map((result, i) => createOrangeRewardNotice(result, String(i))).filter(Boolean);
  assert.equal(notices.length, 1);
  assert.equal(notices[0].amount, 17);
  assert.equal(ok(await f.service().loadWallet()).balance, 265);
});

test('a prior water grant with a different delivery ID is reused safely for welcome qualification', async () => {
  const f = fixture(), service = f.service();
  ok(await service.processRewardEvent({ ...context, type: 'waterGoalCompleted', eventId: 'earlier-producer-id' }));
  const batch = await rewardWaterGoalReached(service, context);
  assert.deepEqual(ok(batch).results.map(result => result.amount), [0, 5, 10]);
  assert.equal(ok(batch).amount, 15);
  assert.equal(ok(batch).wallet.balance, 265);
});

test('already-rewarded water can earn only the missing active-day bonus for an established wallet', async () => {
  const f = fixture(), service = f.service(); await establish(service);
  ok(await service.processRewardEvent({ ...context, type: 'waterGoalCompleted', eventId: 'old-water' }));
  assert.equal(ok(await rewardWaterGoalReached(service, context)).amount, 5);
});

test('local context uses local calendar getters, water remains uncapped, copy has correct Russian units', () => {
  const local = new Date(2026, 9, 18, 0, 15);
  const result = createLocalRewardContext(local);
  assert.equal(result.localDay, '2026-10-18');
  assert.equal(result.occurredAt, local.toISOString());
  assert.deepEqual(addWaterPortion(2450, 2500, 250), { consumedMl: 2700, goalReached: true });
  assert.equal(addWaterPortion(2250, 0, 250).goalReached, false);
  const copy = getRewardMessages('ru');
  assert.deepEqual([1, 2, 7, 17, 21].map(copy.unit), ['апельсин', 'апельсина', 'апельсинов', 'апельсинов', 'апельсин']);
});

test('real zero-balance wallet uses the same bundle, without any demo-specific increment', async () => {
  const f = fixture('real');
  const batch = await rewardWaterGoalReached(f.service(), context);
  assert.equal(ok(batch).wallet.balance, 17);
  assert.equal(ok(batch).wallet.state.seed.amount, 0);
});
