const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const {
  evaluateReward, createOrangeBalance, calculateRewardBalance, calculateLedgerBalance,
  defaultRewardRules, rewardsMock,
} = require(path.join(process.env.CHEBUFIT_REWARDS_BUILD, 'index.js'));

const day = '2026-10-17';
const nextDay = '2026-10-18';
const grantedAt = '2026-10-19T12:00:00Z';
const event = (type, extra = {}) => ({
  type, eventId: `delivery-${type}`, occurredAt: '2026-10-17T23:30:00-03:00', localDay: day, ...extra,
});
const meal = (slot, extra = {}) => event('mealLogged', { mealSlotId: slot, eventId: `meal-${slot}`, ...extra });
const evaluate = (candidate, history = [], rules = defaultRewardRules, balance = 0) => evaluateReward({
  balance: createOrangeBalance(balance), event: candidate, history, rules, grantedAt,
});
const grant = (candidate, history = [], rules) => {
  const result = evaluate(candidate, history, rules);
  assert.equal(result.granted, true, JSON.stringify(result));
  assert.equal(result.reason, 'granted');
  assert.ok(Number.isSafeInteger(result.newBalance));
  return result.grant;
};
const denied = (result, reason) => {
  assert.equal(result.granted, false);
  assert.equal(result.amount, 0);
  assert.equal(result.reason, reason);
  assert.equal('grant' in result, false);
};

test('A/B: first meal earns 2; same logical slot with a new delivery/record cannot farm rewards', () => {
  const first = evaluate(meal('breakfast'), [], undefined, 248);
  assert.equal(first.granted, true);
  assert.equal(first.amount, 2);
  assert.equal(first.newBalance, 250);
  denied(evaluate(meal('breakfast', { eventId: 'recreated-breakfast' }), [first.grant]), 'alreadyGranted');
  assert.deepEqual(evaluate(meal('breakfast')), evaluate(meal('breakfast')), 'evaluation is deterministic');
});

test('C/D: four distinct meal slots earn 8; a fifth distinct slot hits the daily cap', () => {
  const history = [];
  for (const slot of ['breakfast', 'lunch', 'dinner', 'snacks']) history.push(grant(meal(slot), history));
  assert.deepEqual(calculateRewardBalance(history), { valid: true, balance: 8 });
  denied(evaluate(meal('late-snack'), history), 'dailyCapReached');
});

test('E/F: water goal earns 3 once per local day, including toggles with new event IDs', () => {
  const first = grant(event('waterGoalCompleted'));
  assert.equal(first.amount, 3);
  denied(evaluate(event('waterGoalCompleted', { eventId: 'retoggled-water' }), [first]), 'alreadyGranted');
});

test('G/H: workout earns 10; another workout on the same day hits the v1 cap', () => {
  const first = grant(event('workoutCompleted', { sourceId: 'session-1' }));
  assert.equal(first.amount, 10);
  denied(evaluate(event('workoutCompleted', { sourceId: 'session-1', eventId: 'recomplete' }), [first]), 'alreadyGranted');
  denied(evaluate(event('workoutCompleted', { sourceId: 'session-2', eventId: 'workout-2' }), [first]), 'dailyCapReached');
});

test('I/J: weight earns 2; editing the same source cannot regrant, including on a later day', () => {
  const first = grant(event('weightLogged', { sourceId: 'weight-entry-1' }));
  assert.equal(first.amount, 2);
  denied(evaluate(event('weightLogged', { sourceId: 'weight-entry-1', eventId: 'edit-weight' }), [first]), 'alreadyGranted');
  denied(evaluate(event('weightLogged', { sourceId: 'weight-entry-1', eventId: 'next-edit', localDay: nextDay }), [first]), 'alreadyGranted');
  denied(evaluate(event('weightLogged', { sourceId: 'weight-entry-2', eventId: 'another-weight' }), [first]), 'dailyCapReached');
});

test('K/L: 7-day streak milestone earns 15 once for that streak instance and milestone', () => {
  const candidate = event('streakMilestone', { streakId: 'streak-start-2026-10-11', milestoneDays: 7 });
  const first = grant(candidate);
  assert.equal(first.amount, 15);
  denied(evaluate({ ...candidate, eventId: 'replay', localDay: nextDay }, [first]), 'alreadyGranted');
  denied(evaluate({ ...candidate, milestoneDays: 14 }), 'unsupportedMilestone');
  assert.equal(grant({ ...candidate, streakId: 'new-streak', eventId: 'later-streak' }, [first]).amount, 15);
});

test('M: daily caps reset by supplied local day, independently of UTC and processing dates', () => {
  for (const candidate of [
    event('waterGoalCompleted'), event('dailyMealsCompleted'), event('dailyTrackingCompleted'),
    event('workoutCompleted', { sourceId: 'first-session' }), event('weightLogged', { sourceId: 'first-weight' }),
  ]) {
    const first = grant(candidate);
    const second = grant({ ...candidate, eventId: `${candidate.type}-tomorrow`, sourceId: 'new-source', localDay: nextDay,
      occurredAt: '2026-10-18T00:15:00+14:00' }, [first]);
    assert.equal(second.localDay, nextDay);
  }
  const meals = ['breakfast', 'lunch', 'dinner', 'snacks'].map(slot => grant(meal(slot)));
  assert.equal(grant(meal('breakfast', { eventId: 'tomorrow-breakfast', localDay: nextDay }), meals).amount, 2);
  assert.equal(grant(event('waterGoalCompleted')).localDay, day, 'UTC instant is Oct 18 but reward day is Oct 17');
});

test('daily completion bonuses have explicit values and logical once-per-day identities', () => {
  for (const type of ['dailyMealsCompleted', 'dailyTrackingCompleted']) {
    const first = grant(event(type));
    assert.equal(first.amount, 5);
    denied(evaluate(event(type, { eventId: `${type}-retry` }), [first]), 'alreadyGranted');
  }
});

test('N: integer grant replay and future debit accounting; no store or purchase operation', () => {
  const grants = [grant(meal('breakfast')), grant(event('waterGoalCompleted'))];
  assert.deepEqual(calculateRewardBalance(grants, 248), { valid: true, balance: 253 });
  assert.deepEqual(calculateLedgerBalance([
    ...grants.map(value => ({ kind: 'credit', grant: value })),
    { kind: 'debit', entryId: 'future-debit', amount: 4, cosmeticItemId: 'future-item' },
  ]), { valid: true, balance: 1 });
  assert.equal(rewardsMock.orangeBalance, 248);
  assert.deepEqual(calculateRewardBalance([]), { valid: true, balance: 0 });
});

test('O: invalid rule, balance, credit and debit values cannot create fractional/negative currency', () => {
  const valid = grant(meal('breakfast'));
  for (const amount of [-2, 0, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const rules = { ...defaultRewardRules, mealLogged: { ...defaultRewardRules.mealLogged, amount } };
    denied(evaluate(meal('breakfast'), [], rules), 'invalidRule');
    assert.deepEqual(calculateRewardBalance([{ ...valid, amount }]), { valid: false, reason: 'invalidEntry' });
    assert.deepEqual(calculateLedgerBalance([{ kind: 'debit', entryId: 'bad', amount, cosmeticItemId: 'item' }], 100),
      { valid: false, reason: 'invalidEntry' });
  }
  for (const value of [-1, 0.25, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => createOrangeBalance(value), RangeError);
    const result = evaluateReward({ balance: value, event: meal('breakfast'), history: [], grantedAt });
    denied(result, 'invalidBalance');
    assert.equal(result.newBalance, null);
    assert.deepEqual(calculateRewardBalance([], value), { valid: false, reason: 'invalidOpeningBalance' });
  }
});

test('ledger rejects duplicate grants/IDs, overdraft, overflow, and invalid history', () => {
  const first = grant(meal('breakfast'));
  assert.deepEqual(calculateRewardBalance([first, first]), { valid: false, reason: 'duplicateEntry' });
  assert.deepEqual(calculateRewardBalance([first, { ...first, grantId: 'different-id' }]), { valid: false, reason: 'duplicateEntry' });
  assert.deepEqual(calculateLedgerBalance([{ kind: 'debit', entryId: 'purchase', amount: 1, cosmeticItemId: 'item' }]),
    { valid: false, reason: 'insufficientFunds' });
  assert.deepEqual(calculateRewardBalance([first], Number.MAX_SAFE_INTEGER), { valid: false, reason: 'balanceOverflow' });
  denied(evaluate(meal('lunch'), [first, first]), 'invalidHistory');
  denied(evaluate(meal('lunch'), [{ ...first, amount: -2 }]), 'invalidHistory');
  denied(evaluate(meal('lunch'), [], undefined, Number.MAX_SAFE_INTEGER), 'balanceOverflow');
});

test('boundary validation rejects malformed events and accepts valid leap-day/local timestamps', () => {
  for (const extra of [{ localDay: '2026-02-30' }, { eventId: '' }, { mealSlotId: '' },
    { occurredAt: '2026-10-17T12:00:00' }, { occurredAt: 'not-a-date' }]) {
    denied(evaluate(meal('breakfast', extra)), 'invalidEvent');
  }
  denied(evaluate(event('workoutCompleted', { sourceId: '' })), 'invalidEvent');
  denied(evaluate(event('streakMilestone', { streakId: 'cycle', milestoneDays: -7 })), 'invalidEvent');
  denied(evaluate(event('calorieDeficit')), 'unsupportedEvent');
  denied(evaluate(event('weightLoss')), 'unsupportedEvent');
  assert.equal(grant(meal('breakfast', { localDay: '2028-02-29', occurredAt: '2028-02-29T10:00:00+01:00' })).amount, 2);
});

test('rules are configurable; identities and duplicate protection survive tuning', () => {
  const rules = { ...defaultRewardRules, mealLogged: { ...defaultRewardRules.mealLogged, amount: 4, dailyCap: 1 } };
  const first = grant(meal('breakfast'), [], rules);
  assert.equal(first.amount, 4);
  denied(evaluate(meal('lunch'), [first], rules), 'dailyCapReached');
  denied(evaluate(meal('breakfast', { eventId: 'new-delivery' }), [first], defaultRewardRules), 'alreadyGranted');
  denied(evaluate(meal('lunch', { eventId: first.eventId }), [first]), 'alreadyGranted');
  for (const dailyCap of [0, -1, 1.5]) {
    denied(evaluate(meal('lunch'), [], { ...defaultRewardRules, mealLogged: { ...defaultRewardRules.mealLogged, dailyCap } }), 'invalidRule');
  }
});

test('evaluation does not mutate caller state/history/rules', () => {
  const candidate = Object.freeze(meal('breakfast'));
  const history = Object.freeze([]);
  const rules = Object.freeze(Object.fromEntries(Object.entries(defaultRewardRules).map(([key, value]) => [key, Object.freeze({ ...value })])));
  assert.equal(evaluate(candidate, history, rules).granted, true);
  assert.equal(history.length, 0);
});
