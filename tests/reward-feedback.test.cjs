const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const { getRewardFeedbackKind, createOrangeRewardNotice, rewardFeedbackTiming } = require(path.join(process.env.CHEBUFIT_REWARDS_BUILD, 'index.js'));
const grant = (eventType, amount) => ({ eventType, amount });
const batch = grants => ({ ok: true, value: { amount: grants.reduce((n, g) => n + g.amount, 0), results: grants.map(g => ({ granted: true, grant: g })) } });

test('ordinary +2 and aggregated +7 produce one micro notice without welcome', () => {
  for (const grants of [[grant('waterGoalCompleted', 2)], [grant('waterGoalCompleted', 2), grant('activeDayQualified', 5)]]) {
    const notice = createOrangeRewardNotice(batch(grants), 'action');
    assert.equal(notice.kind, 'micro');
    assert.equal(notice.amount, grants.reduce((n, g) => n + g.amount, 0));
    assert.equal(notice.includesWelcome, false);
  }
});
test('welcome aggregates all +17 into one celebration', () => {
  assert.deepEqual(createOrangeRewardNotice(batch([grant('waterGoalCompleted', 2), grant('activeDayQualified', 5), grant('welcomeReward', 10)]), 'first'), { id: 'first', kind: 'celebration', amount: 17, includesWelcome: true });
});
test('milestone is a celebration with other grants or by itself', () => {
  assert.equal(getRewardFeedbackKind([grant('activeDayMilestone', 10)]), 'celebration');
  assert.equal(getRewardFeedbackKind([grant('waterGoalCompleted', 2), grant('activeDayMilestone', 75)]), 'celebration');
});
test('amount never promotes an ordinary reward to celebration', () => {
  assert.equal(getRewardFeedbackKind([grant('workoutCompleted', 1000)]), 'micro');
  assert.equal(getRewardFeedbackKind([grant('welcomeReward', 1)]), 'celebration');
  for (const type of ['mealLogged', 'plannedMealsCompleted', 'waterGoalCompleted', 'workoutCompleted', 'weightLogged', 'activeDayQualified']) assert.equal(getRewardFeedbackKind([grant(type, 2)]), 'micro');
});
test('declined welcome or milestone does not promote an ordinary persisted grant', () => {
  const result = batch([grant('waterGoalCompleted', 2)]);
  result.value.results.push({ granted: false, amount: 0, reason: 'alreadyGranted' });
  assert.equal(createOrangeRewardNotice(result, 'ordinary').kind, 'micro');
});
test('zero, invalid amount and failed persistence never create feedback', () => {
  assert.equal(createOrangeRewardNotice(batch([]), 'empty'), null);
  assert.equal(createOrangeRewardNotice({ ok: false, error: 'storageUnavailable' }, 'failed'), null);
  for (const amount of [-1, 0, 1.5, Infinity, NaN]) assert.equal(createOrangeRewardNotice({ ok: true, value: { amount, results: [] } }, 'invalid'), null);
});
test('feedback lifetime budgets include entrance and exit', () => {
  assert.equal(Object.values(rewardFeedbackTiming.micro).reduce((a, b) => a + b), 1800);
  assert.equal(Object.values(rewardFeedbackTiming.celebration).reduce((a, b) => a + b), 2700);
});
