const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const { createOrangeWalletService, createInitialWallet, decodeOrangeWallet, getWalletSnapshot } = require(path.join(process.env.CHEBUFIT_REWARDS_BUILD, 'index.js'));
const { createKeyValueOrangeWalletRepository } = require(process.env.CHEBUFIT_WALLET_ADAPTER_BUILD);

const now = () => '2026-10-19T12:00:00Z';
const event = (type, extra = {}) => ({ type, eventId: type, occurredAt: '2026-10-17T23:30:00-03:00', localDay: '2026-10-17', ...extra });
function fixture(mode = 'real') {
  const data = new Map();
  let writes = 0, failRead = false, failWrite = false;
  const storage = {
    async getItem(key) { await Promise.resolve(); if (failRead) throw Error('read failed'); return data.get(key) ?? null; },
    async setItem(key, value) { await Promise.resolve(); if (failWrite) throw Error('write failed'); writes++; data.set(key, value); },
  };
  const repository = createKeyValueOrangeWalletRepository(storage, mode);
  const service = () => createOrangeWalletService(createKeyValueOrangeWalletRepository(storage, mode), { now, allowDevelopmentReset: true });
  return { data, storage, repository, service, get writes() { return writes; }, failRead(value) { failRead = value; }, failWrite(value) { failWrite = value; } };
}
const ok = result => { assert.equal(result.ok, true, JSON.stringify(result)); return result.value; };
const credited = async (service, candidate) => {
  const value = ok(await service.processRewardEvent(candidate));
  assert.equal(value.result.granted, true, JSON.stringify(value.result));
  return value;
};
const declined = async (service, candidate) => {
  const value = ok(await service.processRewardEvent(candidate));
  assert.equal(value.result.granted, false);
  assert.equal(value.result.amount, 0);
  return value;
};

test('A/B: empty real wallet is zero; demo is 248 without a single fabricated grant', async () => {
  for (const [mode, amount, seedKind] of [['real', 0, 'none'], ['developmentDemo', 248, 'developmentDemo']]) {
    const f = fixture(mode), wallet = ok(await f.service().loadWallet());
    assert.equal(wallet.state.schemaVersion, 1);
    assert.equal(wallet.balance, amount);
    assert.equal(wallet.state.seed.kind, seedKind);
    assert.deepEqual(wallet.state.ledger, []);
    assert.equal(f.writes, 1);
    const raw = JSON.parse(f.data.get(f.repository.identity));
    assert.equal('balance' in raw, false, 'no duplicate balance source of truth');
    assert.equal('processedIdentities' in raw, false, 'identities live in canonical grants');
  }
});

test('C/D/E: successful grant persists; new service/repository reload balance and reject replay without writing', async () => {
  const f = fixture(), first = await credited(f.service(), event('mealLogged'));
  assert.equal(first.wallet.balance, 2);
  assert.equal(first.wallet.state.ledger.length, 1);
  assert.equal(ok(await f.service().loadWallet()).balance, 2);
  const before = f.writes;
  assert.equal((await declined(f.service(), event('mealLogged', { eventId: 'new-delivery' }))).result.reason, 'alreadyGranted');
  assert.equal(f.writes, before);
});

test('F/G: daily and weekly identities/caps survive reload and reset at correct local boundaries', async () => {
  const f = fixture();
  await credited(f.service(), event('mealLogged'));
  await declined(f.service(), event('mealLogged', { eventId: 'different-meal', sourceId: 'another-meal' }));
  await credited(f.service(), event('mealLogged', { eventId: 'tomorrow', localDay: '2026-10-18' }));
  await credited(f.service(), event('weightLogged', { sourceId: 'weight-1' }));
  await declined(f.service(), event('weightLogged', { sourceId: 'weight-2', eventId: 'weight-sunday', localDay: '2026-10-18' }));
  await credited(f.service(), event('weightLogged', { sourceId: 'weight-2', eventId: 'weight-monday', localDay: '2026-10-19' }));
  assert.equal(ok(await f.service().loadWallet()).balance, 6);
});

test('H: welcome qualification and lifetime uniqueness survive reload', async () => {
  const f = fixture(), candidate = event('welcomeReward', { qualifyingEventId: 'mealLogged' });
  assert.equal((await declined(f.service(), candidate)).result.reason, 'notEligible');
  assert.equal(f.writes, 0, 'ineligible candidate must not initialize storage');
  await credited(f.service(), event('mealLogged'));
  await credited(f.service(), candidate);
  await declined(f.service(), { ...candidate, eventId: 'reinstall', localDay: '2030-01-01' });
  assert.equal(ok(await f.service().loadWallet()).balance, 12);
});

test('I: retained nonconsecutive active-day grants preserve milestone counts and uniqueness across reload', async () => {
  const f = fixture();
  for (let i = 0; i < 7; i++) {
    const localDay = new Date(Date.UTC(2026, 0, 1 + i * 3)).toISOString().slice(0, 10);
    await credited(f.service(), event('activeDayQualified', { localDay, sourceId: `food-${i}`, category: 'foodTracking', eventId: `active-${i}` }));
  }
  const candidate = event('activeDayMilestone', { activeDays: 7 });
  await credited(f.service(), candidate);
  await declined(f.service(), { ...candidate, eventId: 'retry', localDay: '2027-01-01' });
  assert.equal(ok(await f.service().loadWallet()).balance, 45);
});

test('J: sequential legitimate grants accumulate from the canonical ledger and preserve seed separately', async () => {
  const f = fixture('developmentDemo'), service = f.service();
  await credited(service, event('mealLogged'));
  await credited(service, event('waterGoalCompleted'));
  await credited(service, event('workoutCompleted', { sourceId: 'workout' }));
  const wallet = ok(await f.service().loadWallet());
  assert.equal(wallet.balance, 255);
  assert.equal(wallet.state.seed.amount, 248);
  assert.equal(wallet.state.ledger.reduce((sum, entry) => sum + entry.grant.amount, 0), 7);
});

test('K: concurrent duplicate calls across service/repository instances in one process cannot double grant', async () => {
  const f = fixture();
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) => f.service().processRewardEvent(event('mealLogged', { eventId: `delivery-${i}` }))));
  assert.equal(results.filter(result => ok(result).result.granted).length, 1);
  assert.equal(ok(await f.service().loadWallet()).balance, 2);
  assert.equal(f.writes, 1);
});

test('concurrent distinct valid events preserve both grants; subscriber failures cannot undo a committed save', async () => {
  const f = fixture(), service = f.service();
  const unsubscribe = service.subscribe(() => { throw Error('consumer failed'); });
  const results = await Promise.all([service.processRewardEvent(event('mealLogged')), f.service().processRewardEvent(event('waterGoalCompleted'))]);
  assert.ok(results.every(result => ok(result).result.granted));
  unsubscribe();
  assert.equal(ok(await f.service().loadWallet()).balance, 4);
});

test('L/M: corrupt/unsupported data is preserved, never replaced with an empty wallet or demo balance', async () => {
  for (const [raw, reason] of [
    ['not-json', 'corruptData'], ['null', 'corruptData'], ['{}', 'corruptData'],
    [JSON.stringify({ ...createInitialWallet('real', now()), schemaVersion: 2 }), 'unsupportedSchema'],
    [JSON.stringify({ ...createInitialWallet('real', now()), ledger: [null] }), 'corruptData'],
    [JSON.stringify({ ...createInitialWallet('real', now()), seed: { kind: 'none', amount: 248 } }), 'corruptData'],
  ]) {
    const f = fixture(); f.data.set(f.repository.identity, raw);
    assert.deepEqual(await f.service().loadWallet(), { ok: false, error: reason });
    assert.deepEqual(await f.service().processRewardEvent(event('mealLogged')), { ok: false, error: reason });
    assert.equal(f.writes, 0);
    assert.equal(f.data.get(f.repository.identity), raw);
  }
});

test('N: explicit development reset restores 248 and empty ledger; real and disabled reset do not write', async () => {
  const f = fixture('developmentDemo');
  await credited(f.service(), event('mealLogged'));
  const reset = ok(await f.service().resetForDevelopment());
  assert.equal(reset.balance, 248);
  assert.deepEqual(reset.state.ledger, []);
  assert.equal(ok(await f.service().loadWallet()).balance, 248);
  const real = fixture();
  assert.deepEqual(await real.service().resetForDevelopment(), { ok: false, error: 'resetDisabled' });
  const disabled = createOrangeWalletService(f.repository, { now });
  const before = f.writes;
  assert.deepEqual(await disabled.resetForDevelopment(), { ok: false, error: 'resetDisabled' });
  assert.equal(f.writes, before);
  assert.equal(real.writes, 0);
});

test('O: persisted negative/fractional seeds and ledger corruption cannot become a valid balance', async () => {
  for (const amount of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
    const state = { ...createInitialWallet('developmentDemo', now()), seed: { kind: 'developmentDemo', amount } };
    assert.deepEqual(decodeOrangeWallet(state, 'developmentDemo'), { ok: false, error: 'corruptData' });
  }
  const f = fixture(); await credited(f.service(), event('mealLogged'));
  const valid = JSON.parse(f.data.get(f.repository.identity));
  for (const amount of [-2, 0.5]) {
    const data = structuredClone(valid); data.ledger[0].grant.amount = amount;
    f.data.set(f.repository.identity, JSON.stringify(data));
    assert.deepEqual(await f.service().loadWallet(), { ok: false, error: 'corruptData' });
  }
  assert.equal(getWalletSnapshot(createInitialWallet('real', now())).value.balance, 0);
});

test('failed reads/writes return typed errors, do not claim a grant, and do not poison the queue', async () => {
  const f = fixture(), service = f.service();
  f.failRead(true);
  assert.deepEqual(await service.loadWallet(), { ok: false, error: 'storageUnavailable' });
  f.failRead(false); f.failWrite(true);
  assert.deepEqual(await service.processRewardEvent(event('mealLogged')), { ok: false, error: 'storageUnavailable' });
  assert.equal(f.data.size, 0);
  f.failWrite(false);
  await credited(service, event('mealLogged'));
  assert.equal(ok(await service.loadWallet()).balance, 2);
});

test('demo and real namespaces remain isolated and cross-mode data is rejected', async () => {
  const f = fixture('developmentDemo');
  await credited(f.service(), event('mealLogged'));
  const realRepository = createKeyValueOrangeWalletRepository(f.storage, 'real');
  const real = createOrangeWalletService(realRepository, { now });
  assert.equal(ok(await real.loadWallet()).balance, 0);
  f.data.set(realRepository.identity, f.data.get(f.repository.identity));
  assert.deepEqual(await real.loadWallet(), { ok: false, error: 'corruptData' });
});
