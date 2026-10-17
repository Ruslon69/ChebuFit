// Approved v1 documentation simulation; no production configuration is written.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'docs/orange-economy-v1.json'), 'utf8'));
const reportPath = path.join(root, 'docs/ORANGE_ECONOMY_V1.md');
const source = fs.readFileSync(path.join(root, 'src/features/rewards/domain/rules.ts'), 'utf8');
// Evaluate only the project's JavaScript object literal, excluding TypeScript syntax.
const literal = source.match(/defaultRewardRules = ([\s\S]+?) as const satisfies RewardRules;/)?.[1];
assert.ok(literal, 'Production rules literal not found');
const rules = JSON.parse(JSON.stringify(vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 })));
assert.equal(config.status, 'approved');
assert.equal(config.version, 1);
assert.deepEqual(rules, config.productionRules, 'Approved documentation and production rules differ');
const names = Object.keys(config.profiles);
const types = Object.keys(rules).filter(type => !['welcomeReward', 'activeDayMilestone'].includes(type));
const milestones = rules.activeDayMilestone.milestones;
const sum = values => values.reduce((a, b) => a + b, 0);
const fixed = value => value.toFixed(2);
const table = (headers, rows) => [
  `| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`,
  ...rows.map(row => `| ${row.join(' | ')} |`),
].join('\n');
for (const profile of Object.values(config.profiles)) {
  for (const type of types) {
    assert.equal(profile[type].length, 7);
    assert.ok(profile[type].every(value => Number.isSafeInteger(value) && value >= 0));
  }
  for (let i = 0; i < 7; i++) {
    const qualified = Number(['mealLogged', 'waterGoalCompleted', 'workoutCompleted'].some(type => profile[type][i] > 0));
    assert.equal(profile.activeDayQualified[i], qualified);
    assert.ok(profile.plannedMealsCompleted[i] <= Number(profile.mealLogged[i] > 0));
  }
}
for (const rule of Object.values(rules)) {
  assert.equal(rule.limit, 1);
  if (rule.amount !== undefined) assert.ok(Number.isSafeInteger(rule.amount) && rule.amount > 0);
}
assert.equal(sum(milestones.map(value => value.amount)), 190);
assert.equal(new Set(milestones.map(value => value.activeDays)).size, milestones.length);

function simulate(profile, days, { welcome = true, startWeekday = 0 } = {}) {
  const totals = Object.fromEntries(types.map(type => [type, 0]));
  const weeklyUsed = new Set(), reached = new Set();
  const points = [], milestoneDates = [];
  let total = 0, activeDays = 0, welcomed = false;
  for (let day = 1; day <= days; day++) {
    const position = startWeekday + day - 1, weekday = position % 7, week = Math.floor(position / 7);
    const isActive = profile.activeDayQualified[weekday] > 0;
    if (isActive) activeDays++;
    let recurring = 0, bonus = 0;
    for (const type of types) {
      const rule = rules[type];
      let count = Math.min(profile[type][weekday], rule.limit);
      if (rule.period === 'localWeek' && count) {
        const identity = `${type}:${week}`;
        count = Number(!weeklyUsed.has(identity));
        weeklyUsed.add(identity);
      }
      const amount = count * rule.amount;
      totals[type] += amount;
      recurring += amount;
    }
    if (welcome && recurring > 0 && !welcomed) { bonus += rules.welcomeReward.amount; welcomed = true; }
    for (const milestone of milestones) {
      if (activeDays >= milestone.activeDays && !reached.has(milestone.activeDays)) {
        reached.add(milestone.activeDays);
        bonus += milestone.amount;
        milestoneDates.push({ activeDays: milestone.activeDays, day });
      }
    }
    total += recurring + bonus;
    assert.ok(Number.isSafeInteger(total) && total >= 0);
    points.push({ day, total, bonus });
  }
  assert.equal(total, sum(Object.values(totals)) + sum(points.map(point => point.bonus)));
  return { total, totals, activeDays, points, milestoneDates };
}
const expected = { Casual: [48, 189, 534, 2108], Regular: [76, 307, 898, 3567], Power: [106, 411, 1183, 4686] };
const recurringExpected = { Casual: 38, Regular: 66, Power: 86 };
for (const name of names) {
  assert.deepEqual(config.assumptions.horizonsDays.map(days => simulate(config.profiles[name], days).total), expected[name]);
  assert.equal(sum(Object.values(simulate(config.profiles[name], 7).totals)), recurringExpected[name]);
}
const power = config.profiles.Power;
assert.equal(simulate({ ...power, weightLogged: Array(7).fill(1) }, 365).total, simulate(power, 365).total);
assert.equal(simulate({ ...power, mealLogged: Array(7).fill(40) }, 365).total, simulate(power, 365).total);
assert.equal(simulate(Object.fromEntries(types.map(type => [type, Array(7).fill(0)])), 365).total, 0);
const afford = (run, price) => {
  const first = run.points.find(point => point.total >= price);
  assert.ok(first);
  assert.ok(first.day === 1 || run.points[first.day - 2].total < price);
  return first.day;
};
for (const tier of config.storeTiers) assert.ok(tier.min <= tier.referencePrice && tier.referencePrice <= tier.max);
const rows = [];
rows.push('### Production rewards\n');
rows.push(table(['Event', 'Oranges', 'Cap'], Object.values(rules).map(rule => [rule.eventType, rule.amount ?? 'Milestones below', `1 / ${rule.period}`])));
rows.push('\n### Baseline earnings (welcome and achieved milestones included once)\n');
rows.push(table(['Days', 'Casual', 'Regular', 'Power', 'Power/Casual'], config.assumptions.horizonsDays.map(days => {
  const totals = names.map(name => simulate(config.profiles[name], days).total);
  return [days, ...totals, `${fixed(totals[2] / totals[0])}x`];
})));
rows.push('\n### Recurring income (excludes welcome and milestones)\n');
rows.push(table(['Profile', 'Per week', 'Per day', 'Normalized 30 days', 'Per active day'], names.map(name => {
  const run = simulate(config.profiles[name], 7), total = sum(Object.values(run.totals));
  return [name, total, fixed(total / 7), fixed(total * 30 / 7), fixed(total / run.activeDays)];
})));
rows.push('\n### Approved store price guidance (not catalog items)\n');
rows.push(table(['Tier', 'Category', 'Approved range', 'Illustrative reference'], config.storeTiers.map(tier => [tier.tier, tier.category, `${tier.min}–${tier.max}`, tier.referencePrice])));
const prices = config.storeTiers.filter(tier => tier.tier !== 2).map(tier => tier.referencePrice);
rows.push('\n### Calendar days to save for one item from zero, no prior spending\n');
rows.push(table(['Profile', ...prices.map((price, i) => `${['First', 'Standard', 'Premium', 'Outfit', 'Rare'][i]} ${price}`)], names.map(name => [name, ...prices.map(price => afford(simulate(config.profiles[name], 730), price))])));
rows.push('\n### First week\n');
rows.push(table(['Profile', 'Without welcome', 'With welcome', 'First 40: without / with welcome (day)'], names.map(name => [name,
  simulate(config.profiles[name], 7, { welcome: false }).total, simulate(config.profiles[name], 7).total,
  `${afford(simulate(config.profiles[name], 30, { welcome: false }), 40)} / ${afford(simulate(config.profiles[name], 30), 40)}`,
])));
rows.push('\n### Lifetime active-day milestones\n');
rows.push(table(['Active days', 'Oranges once', 'Casual calendar day', 'Regular calendar day', 'Power calendar day'], milestones.map(milestone => [milestone.activeDays, milestone.amount,
  ...names.map(name => simulate(config.profiles[name], 730).milestoneDates.find(value => value.activeDays === milestone.activeDays).day),
])));
rows.push('\n### Gross issuance and illustrative spending\n');
rows.push(`Purchases (day → amount): ${config.illustrativePurchases.map(value => `${value.day} → ${value.amount}`).join('; ')}.\n`);
for (const name of names) {
  let spent = 0;
  for (const purchase of config.illustrativePurchases) {
    const tier = config.storeTiers.find(tier => tier.tier === purchase.tier);
    assert.ok(purchase.amount >= tier.min && purchase.amount <= tier.max);
    spent += purchase.amount;
    assert.ok(simulate(config.profiles[name], purchase.day).total >= spent);
  }
}
rows.push(table(['Approx. months / days', 'Gross C / R / P', 'Spent to date', 'Wallets C / R / P'], config.assumptions.inflationHorizonsDays.map((days, index) => {
  const totals = names.map(name => simulate(config.profiles[name], days).total);
  const spent = sum(config.illustrativePurchases.filter(value => value.day <= days).map(value => value.amount));
  return [`${[1, 3, 6, 12][index]} / ${days}`, totals.join(' / '), spent, totals.map(total => total - spent).join(' / ')];
})));
rows.push('\n### First-30-day sensitivity to starting weekday\n');
rows.push(table(['Profile', 'Range including bonuses'], names.map(name => {
  const values = Array.from({ length: 7 }, (_, startWeekday) => simulate(config.profiles[name], 30, { startWeekday }).total);
  return [name, `${Math.min(...values)}–${Math.max(...values)}`];
})));
const zero = Array(7).fill(0);
const nutritionOnly = { ...config.profiles.Regular, waterGoalCompleted: zero, workoutCompleted: zero, weightLogged: zero };
const trainingFocused = { ...config.profiles.Regular, mealLogged: zero, plannedMealsCompleted: zero, weightLogged: zero, activeDayQualified: [1,1,0,1,1,1,0] };
const recurring = profile => sum(Object.values(simulate(profile, 7).totals));
assert.equal(recurring(nutritionOnly), 46);
assert.equal(recurring(trainingFocused), 44);
rows.push(`\nFairness examples, recurring: nutrition-only **${recurring(nutritionOnly)}/week** (6 food days);\ntraining-focused **${recurring(trainingFocused)}/week** (3 workouts, 5 water-goal days).\nDaily weighing earns **0 extra** over the modeled weekly rewarded weight log.\n`);
const block = `<!-- simulation:start -->\n${rows.join('\n')}\n<!-- simulation:end -->`;
const report = fs.readFileSync(reportPath, 'utf8');
assert.equal((report.match(/<!-- simulation:start -->/g) ?? []).length, 1);
const updated = report.replace(/<!-- simulation:start -->[\s\S]*?<!-- simulation:end -->/, block);
if (process.argv.includes('--write')) fs.writeFileSync(reportPath, updated);
else assert.equal(report, updated, 'Stale tables: run with --write and review');
console.log(JSON.stringify({ status: 'PASS', economyVersion: config.version, approvedConfigMatchesProduction: true,
  horizonsDays: config.assumptions.horizonsDays, earnings: expected, recurringPerWeek: recurringExpected,
  tables: process.argv.includes('--write') ? 'written' : 'verified',
}, null, 2));
