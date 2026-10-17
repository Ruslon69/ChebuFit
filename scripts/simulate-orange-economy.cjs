// Documentation simulation only. No production modules/configuration are modified.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'docs/orange-economy-v1.json'), 'utf8'));
const reportPath = path.join(root, 'docs/ORANGE_ECONOMY_V1.md');
const names = Object.keys(config.profiles);
const types = Object.keys(config.proposedRewards);
const sum = values => values.reduce((a, b) => a + b, 0);
const fixed = value => value.toFixed(2);
const table = (headers, rows) => [
  `| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`,
  ...rows.map(row => `| ${row.join(' | ')} |`),
].join('\n');
const active = (profile, weekday) => ['mealLogged', 'waterGoalCompleted', 'workoutCompleted']
  .some(type => profile[type][weekday] > 0);

// Verify the documentation baseline against the real rules without loading Expo/TS.
const rulesSource = fs.readFileSync(path.join(root, 'src/features/rewards/domain/rules.ts'), 'utf8');
const snapshot = Object.fromEntries([...rulesSource.matchAll(
  /^\s+(\w+): \{ eventType: '[^']+', amount: (\d+), dailyCap: (null|\d+)(?:, milestoneDays: (\d+))? \}/gm,
)].map(([, type, amount, cap, milestone]) => [type, {
  amount: Number(amount), dailyCap: cap === 'null' ? null : Number(cap),
  ...(milestone ? { milestoneDays: Number(milestone) } : {}),
}]));
assert.deepEqual(snapshot, config.currentRulesSnapshot, 'Production snapshot drifted; review this proposal baseline');
for (const profile of Object.values(config.profiles)) {
  for (const type of types) {
    assert.equal(profile[type].length, 7);
    assert.ok(profile[type].every(value => Number.isSafeInteger(value) && value >= 0));
  }
  for (let i = 0; i < 7; i++) {
    assert.ok(profile.dailyMealsCompleted[i] <= Number(profile.mealLogged[i] > 0));
    assert.ok(profile.dailyTrackingCompleted[i] <= Number(active(profile, i)));
  }
}
for (const rules of [snapshot, config.proposedRewards]) {
  for (const rule of Object.values(rules)) {
    assert.ok(Number.isSafeInteger(rule.amount) && rule.amount > 0);
    assert.ok(rule.dailyCap === null || (Number.isSafeInteger(rule.dailyCap) && rule.dailyCap > 0));
  }
}
assert.equal(sum(config.activeDayMilestones.rewards.map(reward => reward.amount)), 190);
assert.equal(config.activeDayMilestones.resetAfterMissedDay, false);
assert.equal(config.activeDayMilestones.repeat, false);
for (const tier of config.storeTiers) {
  assert.ok(tier.min <= tier.referencePrice && tier.referencePrice <= tier.max);
  assert.ok([tier.min, tier.max, tier.referencePrice].every(Number.isSafeInteger));
}

function simulate(profile, days, proposed, { welcome = proposed, startWeekday = 0 } = {}) {
  const rules = proposed ? config.proposedRewards : snapshot;
  const totals = Object.fromEntries(types.map(type => [type, 0]));
  const weeklyUsed = new Map();
  const milestones = [];
  const points = [];
  let activeDays = 0, consecutive = 0, total = 0, welcomed = false;
  for (let day = 1; day <= days; day++) {
    const position = startWeekday + day - 1;
    const weekday = position % 7;
    const week = Math.floor(position / 7);
    const isActive = active(profile, weekday);
    if (isActive) activeDays++;
    consecutive = isActive ? consecutive + 1 : 0;
    let recurring = 0;
    for (const type of types) {
      const rule = rules[type];
      const count = proposed && type === 'dailyTrackingCompleted' ? Number(isActive) : profile[type][weekday];
      let grants = Math.min(count, rule.dailyCap);
      if (rule.weeklyCap !== undefined) {
        const key = `${week}:${type}`;
        grants = Math.min(grants, rule.weeklyCap - (weeklyUsed.get(key) ?? 0));
        weeklyUsed.set(key, (weeklyUsed.get(key) ?? 0) + grants);
        assert.ok(weeklyUsed.get(key) <= rule.weeklyCap);
      }
      const amount = grants * rule.amount;
      totals[type] += amount;
      recurring += amount;
    }
    let bonus = 0;
    if (proposed) {
      for (const milestone of config.activeDayMilestones.rewards) {
        if (isActive && activeDays === milestone.activeDays) {
          bonus += milestone.amount;
          milestones.push({ day, threshold: milestone.activeDays, amount: milestone.amount });
        }
      }
      if (welcome && isActive && !welcomed) { bonus += config.welcomeReward.amount; welcomed = true; }
    } else if (consecutive === snapshot.streakMilestone.milestoneDays) {
      bonus += snapshot.streakMilestone.amount;
      milestones.push({ day, threshold: consecutive, amount: bonus });
    }
    total += recurring + bonus;
    assert.ok(Number.isSafeInteger(total) && total >= 0);
    points.push({ day, total, recurring, bonus });
  }
  if (proposed) assert.equal(new Set(milestones.map(value => value.threshold)).size, milestones.length);
  assert.equal(total, sum(Object.values(totals)) + sum(points.map(value => value.bonus)));
  return { total, totals, activeDays, milestones, points };
}

// Independent hand-calculated checks, including partial weeks and current one-off streak.
const currentExpected = { Casual: [52, 225, 676, 2708], Regular: [127, 548, 1651, 6623], Power: [206, 839, 2479, 9978] };
const proposedExpected = { Casual: [48, 189, 534, 2108], Regular: [76, 307, 898, 3567], Power: [106, 411, 1183, 4686] };
const weeklyProposed = { Casual: 38, Regular: 66, Power: 86 };
for (const name of names) {
  assert.deepEqual(config.assumptions.horizonsDays.map(days => simulate(config.profiles[name], days, false).total), currentExpected[name]);
  assert.deepEqual(config.assumptions.horizonsDays.map(days => simulate(config.profiles[name], days, true).total), proposedExpected[name]);
  assert.equal(sum(Object.values(simulate(config.profiles[name], 7, true, { welcome: false }).totals)), weeklyProposed[name]);
}
// Frequent weighing changes neither weekly reward nor qualification; repeated meal logs hit cap 1.
const power = config.profiles.Power;
assert.equal(simulate({ ...power, weightLogged: Array(7).fill(1) }, 365, true).total, simulate(power, 365, true).total);
assert.equal(simulate({ ...power, mealLogged: Array(7).fill(40) }, 365, true).total, simulate(power, 365, true).total);
assert.equal(simulate(Object.fromEntries(types.map(type => [type, Array(7).fill(0)])), 365, true).total, 0);

const affordability = (run, price) => {
  const first = run.points.find(point => point.total >= price);
  assert.ok(first, `No affordability date for ${price}`);
  assert.ok(first.day === 1 || run.points[first.day - 2].total < price);
  return first.day;
};
const purchasePrices = config.storeTiers.filter(tier => tier.tier !== 2).map(tier => tier.referencePrice);
const rows = [];
rows.push('### Weekly input scenarios (counts, before caps)\n');
rows.push(table(['Profile', 'Food days / meal slots', 'Meals complete', 'Water', 'Workouts', 'Weight', 'Complete tracking', 'Active days'], names.map(name => {
  const profile = config.profiles[name];
  return [name, `${profile.mealLogged.filter(Boolean).length} / ${sum(profile.mealLogged)}`, ...types.slice(1).map(type => sum(profile[type])),
    Array.from({ length: 7 }, (_, day) => Number(active(profile, day))).reduce((a, b) => a + b, 0)];
})));
rows.push('\n### Current earnings (includes qualified current streak bonus)\n');
rows.push(table(['Days', 'Profile', 'Earned', 'Average/day', 'Average/week'], config.assumptions.horizonsDays.flatMap(days => names.map(name => {
  const total = simulate(config.profiles[name], days, false).total;
  return [days, name, total, fixed(total / days), fixed(total * 7 / days)];
}))));
rows.push('\n### Profile spread and legitimate current ceiling\n');
const dailyMaximum = sum(types.map(type => snapshot[type].amount * snapshot[type].dailyCap));
assert.equal(dailyMaximum, 33);
rows.push(table(['Days', 'Regular − Casual', 'Power − Casual', 'Power/Casual', '33/day + one qualified 15'], config.assumptions.horizonsDays.map(days => {
  const totals = names.map(name => simulate(config.profiles[name], days, false).total);
  return [days, totals[1] - totals[0], totals[2] - totals[0], `${fixed(totals[2] / totals[0])}x`, 33 * days + (days >= 7 ? 15 : 0)];
})));
rows.push('\nThe last column assumes a legitimate uninterrupted streak. It is not the absolute\nengine-enforced maximum: fresh unverified streak IDs are currently uncapped.\n');
rows.push('\n### Recommended reward values (proposal only)\n');
rows.push(table(['Event', 'Current', 'Proposed', 'Proposed cap', 'Reason'], types.map(type => {
  const rule = config.proposedRewards[type];
  return [type, snapshot[type].amount, rule.amount, `${rule.dailyCap}/day${rule.weeklyCap ? `; ${rule.weeklyCap}/local week` : ''}`, rule.reason];
}).concat([['streakMilestone', 15, '10 / 20 / 35 / 50 / 75', 'Lifetime thresholds below', 'Cumulative active days; no reset']])));
rows.push('\n### Proposed earnings (includes welcome and achieved lifetime milestones)\n');
rows.push(table(['Days', 'Casual', 'Regular', 'Power', 'Power/Casual'], config.assumptions.horizonsDays.map(days => {
  const totals = names.map(name => simulate(config.profiles[name], days, true).total);
  return [days, ...totals, `${fixed(totals[2] / totals[0])}x`];
})));
rows.push('\n### Price ladder (orange ranges; categories only, no catalog)\n');
rows.push(table(['Tier', 'Category', 'Range', 'Reference price'], config.storeTiers.map(tier => [tier.tier, tier.category, `${tier.min}–${tier.max}`, tier.referencePrice])));
rows.push('\n### Calendar days to afford one item from zero (no previous purchases)\n');
rows.push(table(['Economy', 'Profile', 'First 40', 'Standard 180', 'Premium 360', 'Outfit 720', 'Rare 1200'], [false, true].flatMap(proposed => names.map(name => {
  const run = simulate(config.profiles[name], 730, proposed);
  return [proposed ? 'Proposed + welcome' : 'Current', name, ...purchasePrices.map(price => affordability(run, price))];
}))));
rows.push('\n### First-week experience\n');
rows.push(table(['Profile', 'Current week 1', 'Proposed without welcome', 'Proposed with 10 welcome', 'Day to 40 without/with welcome'], names.map(name => [
  name, simulate(config.profiles[name], 7, false).total, simulate(config.profiles[name], 7, true, { welcome: false }).total,
  simulate(config.profiles[name], 7, true).total,
  `${affordability(simulate(config.profiles[name], 30, true, { welcome: false }), 40)} / ${affordability(simulate(config.profiles[name], 30, true), 40)}`,
])));
rows.push('\n### Lifetime active-day milestones (calendar day reached in each schedule)\n');
rows.push(table(['Active days', 'Oranges once', 'Casual', 'Regular', 'Power'], config.activeDayMilestones.rewards.map(milestone => [
  milestone.activeDays, milestone.amount, ...names.map(name => simulate(config.profiles[name], 730, true).milestones.find(value => value.threshold === milestone.activeDays).day),
])));
rows.push('\n### Currency creation / inflation (gross; before purchases)\n');
rows.push(table(['Approx. months / days', 'Current C / R / P', 'Proposed C / R / P'], config.assumptions.inflationHorizonsDays.map((days, index) => [
  `${[1, 3, 6, 12][index]} / ${days}`, names.map(name => simulate(config.profiles[name], days, false).total).join(' / '),
  names.map(name => simulate(config.profiles[name], days, true).total).join(' / '),
])));
rows.push('\n### Illustrative spending and proposed remaining wallets\n');
rows.push('Purchase schedule: day 30 → 100; 60 → 180; 90 → 100; 180 → 360;\n270 → 180; 365 → 720. Each is within its tier range. All are affordable.\n');
for (const purchase of config.illustrativePurchases) {
  const tier = config.storeTiers.find(tier => tier.tier === purchase.tier);
  assert.ok(purchase.amount >= tier.min && purchase.amount <= tier.max);
}
for (const name of names) {
  let spent = 0;
  for (const purchase of config.illustrativePurchases) {
    spent += purchase.amount;
    assert.ok(simulate(config.profiles[name], purchase.day, true).total >= spent, `${name} cannot afford purchase at ${purchase.day}`);
  }
}
rows.push(table(['Days', 'Spent to date', 'Casual wallet', 'Regular wallet', 'Power wallet'], config.assumptions.inflationHorizonsDays.map(days => {
  const spent = sum(config.illustrativePurchases.filter(purchase => purchase.day <= days).map(purchase => purchase.amount));
  return [days, spent, ...names.map(name => simulate(config.profiles[name], days, true).total - spent)];
})));
rows.push('\n### Fairness and steady recurring income (excludes one-time bonuses)\n');
rows.push(table(['Profile', 'Per week', 'Per day', 'Normalized 30 days', 'Per active day', 'Food %', 'Workout %', 'Weight %'], names.map(name => {
  const run = simulate(config.profiles[name], 7, true, { welcome: false });
  const total = sum(Object.values(run.totals));
  return [name, total, fixed(total / 7), fixed(total * 30 / 7), fixed(total / run.activeDays),
    fixed(100 * (run.totals.mealLogged + run.totals.dailyMealsCompleted) / total),
    fixed(100 * run.totals.workoutCompleted / total), fixed(100 * run.totals.weightLogged / total)];
})));
rows.push('\nNormalized 30-day income is the recurring weekly rate × 30/7, excluding welcome\nand milestones. Actual calendar-month totals vary with weekday mix and milestones.\n');
const zero = Array(7).fill(0);
const nutritionOnly = { ...config.profiles.Regular, waterGoalCompleted: zero, workoutCompleted: zero, weightLogged: zero };
const trainingFocused = { ...config.profiles.Regular, mealLogged: zero, dailyMealsCompleted: zero, weightLogged: zero };
const workoutsOnly = { ...trainingFocused, waterGoalCompleted: zero };
const recurring = profile => sum(Object.values(simulate(profile, 7, true).totals));
assert.equal(recurring(nutritionOnly), 46);
assert.equal(recurring(trainingFocused), 44);
assert.equal(recurring(workoutsOnly), 24);
rows.push(`\nNutrition-only (6 food days, 4 complete): **${recurring(nutritionOnly)}/week**.\nTraining-focused (3 workouts, 5 water goals, no food/weight): **${recurring(trainingFocused)}/week**.\nWorkouts only (3 active days, no other tracking): **${recurring(workoutsOnly)}/week**.\nDaily weighing instead of the Power schedule earns **0 extra** under the weekly cap.\n`);
rows.push('\n### Starting-weekday sensitivity: first 30 days\n');
rows.push(table(['Profile', 'Current range', 'Proposed range including welcome/milestones'], names.map(name => {
  const ranges = [false, true].map(proposed => Array.from({ length: 7 }, (_, startWeekday) => simulate(config.profiles[name], 30, proposed, { startWeekday }).total));
  return [name, ...ranges.map(values => `${Math.min(...values)}–${Math.max(...values)}`)];
})));

const block = `<!-- simulation:start -->\n${rows.join('\n')}\n<!-- simulation:end -->`;
const report = fs.readFileSync(reportPath, 'utf8');
assert.equal((report.match(/<!-- simulation:start -->/g) ?? []).length, 1);
const updated = report.replace(/<!-- simulation:start -->[\s\S]*?<!-- simulation:end -->/, block);
if (process.argv.includes('--write')) fs.writeFileSync(reportPath, updated);
else assert.equal(report, updated, 'Report tables are stale; run with --write and review');
console.log(JSON.stringify({
  status: 'PASS', productionRulesMatchSnapshot: true, proposedRecurringPerWeek: weeklyProposed,
  currentEarnings: currentExpected,
  proposedEarnings: Object.fromEntries(names.map(name => [name, config.assumptions.horizonsDays.map(days => simulate(config.profiles[name], days, true).total)])),
  theoreticalDailyCurrent: dailyMaximum, currentStreakDailyProductCap: 'absent; numeric overflow guard only',
  reportTables: process.argv.includes('--write') ? 'written' : 'verified',
}, null, 2));
