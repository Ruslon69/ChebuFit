const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const {
  evaluateReward, createOrangeBalance, calculateRewardBalance, calculateLedgerBalance,
  defaultRewardRules, rewardsMock, getLocalWeekStart,
} = require(path.join(process.env.CHEBUFIT_REWARDS_BUILD, 'index.js'));

const day = '2026-10-17';
const nextDay = '2026-10-18';
const grantedAt = '2026-10-19T12:00:00Z';
const event = (type, extra = {}) => ({
  type, eventId: `delivery-${type}`, occurredAt: '2026-10-17T23:30:00-03:00', localDay: day, ...extra,
});
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
const active = (extra = {}) => event('activeDayQualified', { category: 'foodTracking', sourceId: 'food-entry', ...extra });

// Real nonconsecutive active-day grants, not caller-reported milestone counts.
const activeHistory = [];
for (let i = 0; i < 365; i++) {
  const localDay = new Date(Date.UTC(2024, 0, 1 + i * 2)).toISOString().slice(0, 10);
  activeHistory.push(grant(active({ localDay, eventId: `active-${i}`, sourceId: `food-${i}`, occurredAt: `${localDay}T12:00:00+01:00` }), activeHistory));
}

test('A/B/C: first meal earns 2; every other meal/recreated source same day earns nothing; next local day resets', () => {
  const first = evaluate(event('mealLogged', { sourceId: 'breakfast' }), [], undefined, 248);
  assert.equal(first.amount, 2);
  assert.equal(first.newBalance, 250);
  for (const sourceId of ['lunch', 'dinner', 'recreated-breakfast']) {
    denied(evaluate(event('mealLogged', { eventId: sourceId, sourceId }), [first.grant]), 'alreadyGranted');
  }
  assert.equal(grant(event('mealLogged', { eventId: 'tomorrow', localDay: nextDay }), [first.grant]).amount, 2);
  assert.equal(first.grant.rewardIdentity, JSON.stringify(['rewards-v1', 'mealLogged', day]));
});

for (const [type, amount] of [['plannedMealsCompleted', 1], ['waterGoalCompleted', 2]]) {
  test(`D/E: ${type} earns ${amount} once per local day`, () => {
    const first = grant(event(type));
    assert.equal(first.amount, amount);
    denied(evaluate(event(type, { eventId: 'retoggle' }), [first]), 'alreadyGranted');
    assert.equal(grant(event(type, { eventId: 'tomorrow', localDay: nextDay }), [first]).amount, amount);
  });
}

test('F: workout earns 3 once/day even for another session; stable sources cannot be relabeled tomorrow', () => {
  const first = grant(event('workoutCompleted', { sourceId: 'session-1' }));
  assert.equal(first.amount, 3);
  denied(evaluate(event('workoutCompleted', { sourceId: 'session-2', eventId: 'different' }), [first]), 'alreadyGranted');
  denied(evaluate(event('workoutCompleted', { sourceId: 'session-1', eventId: 'edit', localDay: nextDay }), [first]), 'alreadyGranted');
  assert.equal(grant(event('workoutCompleted', { sourceId: 'session-2', eventId: 'new', localDay: nextDay }), [first]).amount, 3);
});

test('G/H/I: weight earns 1 per local week; recreated/edited logs cannot farm; a new entry next week earns 1', () => {
  const first = grant(event('weightLogged', { sourceId: 'entry-1' }));
  assert.equal(first.amount, 1);
  assert.equal(first.localWeek, '2026-10-12');
  denied(evaluate(event('weightLogged', { sourceId: 'entry-2', eventId: 'sunday', localDay: nextDay }), [first]), 'alreadyGranted');
  denied(evaluate(event('weightLogged', { sourceId: 'entry-1', eventId: 'edited', localDay: '2026-10-19' }), [first]), 'alreadyGranted');
  const second = grant(event('weightLogged', { sourceId: 'entry-2', eventId: 'monday', localDay: '2026-10-19' }), [first]);
  assert.equal(second.amount, 1);
  assert.equal(second.localWeek, '2026-10-19');
});

test('J: welcome earns 10 only after an existing useful tracking grant, once for wallet lifetime', () => {
  const meal = grant(event('mealLogged'));
  const candidate = event('welcomeReward', { qualifyingEventId: meal.eventId });
  denied(evaluate(candidate), 'notEligible');
  denied(evaluate({ ...candidate, qualifyingEventId: 'app-opened' }, [meal]), 'notEligible');
  const first = grant(candidate, [meal]);
  assert.equal(first.amount, 10);
  assert.equal(first.rewardIdentity, JSON.stringify(['rewards-v1', 'welcomeReward']));
  denied(evaluate({ ...candidate, eventId: 're-onboarded', localDay: '2030-01-01' }, [meal, first]), 'alreadyGranted');
  denied(evaluate(event('appOpened')), 'unsupportedEvent');
});

test('K: any approved already-qualified active-day category earns 5, but only one grant per day', () => {
  const first = grant(active());
  assert.equal(first.amount, 5);
  for (const category of ['foodTracking', 'waterTracking', 'completedWorkout']) {
    denied(evaluate(active({ category, eventId: category, sourceId: category }), [first]), 'alreadyGranted');
    assert.equal(grant(active({ category })).amount, 5);
  }
});

test('L: weight-only activity never emits/qualifies an active day or a milestone', () => {
  const weight = grant(event('weightLogged', { sourceId: 'weight' }));
  assert.equal(weight.eventType, 'weightLogged');
  assert.deepEqual(calculateRewardBalance([weight]), { valid: true, balance: 1 });
  denied(evaluate(active({ category: 'weightTracking' }), [weight]), 'invalidEvent');
  denied(evaluate(event('activeDayMilestone', { activeDays: 7 }), [weight]), 'notEligible');
});

for (const [activeDays, amount] of [[7, 10], [30, 20], [90, 35], [180, 50], [365, 75]]) {
  test(`M–S: ${activeDays} nonconsecutive lifetime active days earn ${amount} once`, () => {
    const candidate = event('activeDayMilestone', { activeDays });
    denied(evaluate(candidate, activeHistory.slice(0, activeDays - 1)), 'notEligible');
    const history = activeHistory.slice(0, activeDays);
    const first = grant(candidate, history);
    assert.equal(first.amount, amount);
    assert.equal(first.rewardIdentity, JSON.stringify(['rewards-v1', 'activeDayMilestone', activeDays]));
    denied(evaluate({ ...candidate, eventId: 'replay', localDay: '2030-05-04' }, [...history, first]), 'alreadyGranted');
  });
}

test('milestones can be processed after a gap/out of order, with no reset or annual repeat', () => {
  const history = [...activeHistory];
  for (const activeDays of [365, 7, 180, 30, 90]) history.push(grant(event('activeDayMilestone', { activeDays, eventId: `milestone-${activeDays}` }), history));
  assert.equal(history.slice(365).reduce((total, value) => total + value.amount, 0), 190);
  denied(evaluate(event('activeDayMilestone', { activeDays: 14 }), history), 'unsupportedMilestone');
  const rules = { ...defaultRewardRules, activeDayMilestone: { ...defaultRewardRules.activeDayMilestone, milestones: [{ activeDays: 14, amount: 12 }] } };
  assert.equal(grant(event('activeDayMilestone', { activeDays: 14 }), activeHistory.slice(0, 14), rules).amount, 12);
});

test('T: local day attribution ignores UTC date and processing date', () => {
  const first = grant(event('mealLogged')); // UTC Oct 18; local Oct 17.
  const second = grant(event('mealLogged', { eventId: 'local-tomorrow', localDay: nextDay, occurredAt: '2026-10-18T00:15:00+14:00' }), [first]);
  assert.equal(first.localDay, day);
  assert.equal(second.localDay, nextDay);
  assert.equal(first.grantedAt, second.grantedAt);
});

test('U: Sunday and next Monday belong to different local weeks; Monday through Sunday share one key', () => {
  for (const date of ['2026-10-12', '2026-10-13', '2026-10-17', '2026-10-18']) assert.equal(getLocalWeekStart(date), '2026-10-12');
  assert.equal(getLocalWeekStart('2026-10-19'), '2026-10-19');
  assert.equal(getLocalWeekStart('2026-02-30'), null);
  assert.equal(getLocalWeekStart('2028-02-29'), '2028-02-28');
});

test('V: a year-spanning week has the Monday date as stable identity, independent of ISO week-number year', () => {
  for (const date of ['2026-12-28', '2026-12-31', '2027-01-01', '2027-01-03']) assert.equal(getLocalWeekStart(date), '2026-12-28');
  const first = grant(event('weightLogged', { sourceId: 'december', localDay: '2026-12-31' }));
  denied(evaluate(event('weightLogged', { sourceId: 'january', eventId: 'jan-1', localDay: '2027-01-01' }), [first]), 'alreadyGranted');
  assert.equal(grant(event('weightLogged', { sourceId: 'new-week', eventId: 'jan-4', localDay: '2027-01-04' }), [first]).localWeek, '2027-01-04');
  assert.equal(getLocalWeekStart('2021-01-01'), '2020-12-28');
});

test('W/Y: integer grant replay, future debits, empty balance, and Today fixture 248', () => {
  const grants = [grant(event('mealLogged')), grant(event('waterGoalCompleted'))];
  assert.deepEqual(calculateRewardBalance(grants, 248), { valid: true, balance: 252 });
  assert.deepEqual(calculateLedgerBalance([
    ...grants.map(value => ({ kind: 'credit', grant: value })),
    { kind: 'debit', entryId: 'future-debit', amount: 3, cosmeticItemId: 'future-item' },
  ]), { valid: true, balance: 1 });
  assert.equal(rewardsMock.orangeBalance, 248);
  assert.deepEqual(calculateRewardBalance([]), { valid: true, balance: 0 });
});

test('X: invalid rule, milestone, balance, credit and debit amounts cannot create fractional/negative currency', () => {
  const valid = grant(event('mealLogged'));
  for (const amount of [-2, 0, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    denied(evaluate(event('mealLogged'), [], { ...defaultRewardRules, mealLogged: { ...defaultRewardRules.mealLogged, amount } }), 'invalidRule');
    denied(evaluate(event('activeDayMilestone', { activeDays: 7 }), activeHistory.slice(0, 7), {
      ...defaultRewardRules, activeDayMilestone: { ...defaultRewardRules.activeDayMilestone, milestones: [{ activeDays: 7, amount }] },
    }), 'invalidRule');
    assert.deepEqual(calculateRewardBalance([{ ...valid, amount }]), { valid: false, reason: 'invalidEntry' });
    assert.deepEqual(calculateLedgerBalance([{ kind: 'debit', entryId: 'bad', amount, cosmeticItemId: 'item' }], 100), { valid: false, reason: 'invalidEntry' });
  }
  for (const value of [-1, 0.25, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => createOrangeBalance(value), RangeError);
    const result = evaluateReward({ balance: value, event: event('mealLogged'), history: [], grantedAt });
    denied(result, 'invalidBalance');
    assert.equal(result.newBalance, null);
    assert.deepEqual(calculateRewardBalance([], value), { valid: false, reason: 'invalidOpeningBalance' });
  }
});

test('ledger/history rejects duplicate identities, IDs, invalid weeks, overdraft, and overflow', () => {
  const first = grant(event('mealLogged'));
  for (const duplicate of [first, { ...first, grantId: 'different-id' }]) assert.deepEqual(calculateRewardBalance([first, duplicate]), { valid: false, reason: 'duplicateEntry' });
  assert.deepEqual(calculateLedgerBalance([{ kind: 'debit', entryId: 'purchase', amount: 1, cosmeticItemId: 'item' }]), { valid: false, reason: 'insufficientFunds' });
  assert.deepEqual(calculateRewardBalance([first], Number.MAX_SAFE_INTEGER), { valid: false, reason: 'balanceOverflow' });
  denied(evaluate(event('waterGoalCompleted'), [first, first]), 'invalidHistory');
  denied(evaluate(event('waterGoalCompleted'), [{ ...first, amount: -2 }]), 'invalidHistory');
  denied(evaluate(event('waterGoalCompleted'), [{ ...first, localWeek: '2026-10-19' }]), 'invalidHistory');
  denied(evaluate(event('waterGoalCompleted'), [], undefined, Number.MAX_SAFE_INTEGER), 'balanceOverflow');
});

test('boundary validation rejects malformed events, legacy types, and outcome rewards', () => {
  for (const extra of [{ localDay: '2026-02-30' }, { eventId: '' }, { sourceId: '' }, { occurredAt: '2026-10-17T12:00:00' },
    { occurredAt: '2026-10-17T24:00:00Z' }, { occurredAt: 'not-a-date' }]) denied(evaluate(event('mealLogged', extra)), 'invalidEvent');
  denied(evaluate(event('workoutCompleted', { sourceId: '' })), 'invalidEvent');
  denied(evaluate(event('activeDayMilestone', { activeDays: -7 })), 'invalidEvent');
  for (const type of ['dailyTrackingCompleted', 'streakMilestone', 'dailyMealsCompleted', 'calorieDeficit', 'weightLoss']) denied(evaluate(event(type)), 'unsupportedEvent');
  assert.equal(grant(event('mealLogged', { localDay: '2028-02-29', occurredAt: '2028-02-29T10:00:00+01:00' })).amount, 2);
});

test('rule tuning does not reset identities; malformed cap periods and duplicate milestone thresholds are rejected', () => {
  const rules = { ...defaultRewardRules, mealLogged: { ...defaultRewardRules.mealLogged, amount: 4 } };
  const first = grant(event('mealLogged'), [], rules);
  assert.equal(first.amount, 4);
  denied(evaluate(event('mealLogged', { eventId: 'new-delivery' }), [first]), 'alreadyGranted');
  denied(evaluate(event('waterGoalCompleted', { eventId: first.eventId }), [first]), 'alreadyGranted');
  for (const limit of [0, -1, 1.5, 2]) denied(evaluate(event('mealLogged'), [], { ...defaultRewardRules, mealLogged: { ...defaultRewardRules.mealLogged, limit } }), 'invalidRule');
  denied(evaluate(event('weightLogged', { sourceId: 'weight' }), [], { ...defaultRewardRules, weightLogged: { ...defaultRewardRules.weightLogged, period: 'localDay' } }), 'invalidRule');
  denied(evaluate(event('activeDayMilestone', { activeDays: 7 }), activeHistory, {
    ...defaultRewardRules, activeDayMilestone: { ...defaultRewardRules.activeDayMilestone, milestones: [{ activeDays: 7, amount: 10 }, { activeDays: 7, amount: 10 }] },
  }), 'invalidRule');
});

test('evaluation is deterministic and never mutates caller events, history, or rules', () => {
  const candidate = Object.freeze(event('mealLogged'));
  const history = Object.freeze([]);
  const rules = Object.freeze(Object.fromEntries(Object.entries(defaultRewardRules).map(([key, value]) => [key, Object.freeze({ ...value })])));
  assert.deepEqual(evaluate(candidate, history, rules), evaluate(candidate, history, rules));
  assert.equal(history.length, 0);
});

test('approved profile projections agree with actual engine grants at 7 and 30 days', () => {
  const config = require('../docs/orange-economy-v1.json');
  const expected = { Casual: [48, 189], Regular: [76, 307], Power: [106, 411] };
  for (const [name, profile] of Object.entries(config.profiles)) {
    const history = [];
    let balance = createOrangeBalance(0);
    const apply = candidate => {
      const result = evaluateReward({ balance, event: candidate, history, grantedAt });
      if (result.granted) { history.push(result.grant); balance = result.newBalance; }
      else assert.ok(['alreadyGranted', 'notEligible'].includes(result.reason), JSON.stringify(result));
    };
    for (let i = 0; i < 30; i++) {
      const localDay = new Date(Date.UTC(2026, 9, 12 + i)).toISOString().slice(0, 10);
      const context = { localDay, occurredAt: `${localDay}T12:00:00+02:00` };
      for (const [type, schedule] of Object.entries(profile)) {
        for (let n = 0; n < schedule[i % 7]; n++) {
          apply(event(type, { ...context, eventId: `${type}-${i}-${n}`, sourceId: `source-${type}-${i}-${n}`,
            ...(type === 'activeDayQualified' ? { category: profile.mealLogged[i % 7] ? 'foodTracking' : profile.waterGoalCompleted[i % 7] ? 'waterTracking' : 'completedWorkout' } : {}),
          }));
        }
      }
      if (history.length) apply(event('welcomeReward', { ...context, eventId: `welcome-${i}`, qualifyingEventId: history[0].eventId }));
      for (const milestone of defaultRewardRules.activeDayMilestone.milestones) {
        apply(event('activeDayMilestone', { ...context, eventId: `milestone-${milestone.activeDays}-${i}`, activeDays: milestone.activeDays }));
      }
      if (i === 6) assert.equal(balance, expected[name][0], `${name} day 7`);
    }
    assert.equal(balance, expected[name][1], `${name} day 30`);
    assert.deepEqual(calculateRewardBalance(history), { valid: true, balance });
  }
});
