# APPROVED ECONOMY V1

ChebuFit Orange Economy v1 is approved and implemented in the pure rewards domain.
`src/features/rewards/domain/rules.ts` is the runtime source of amounts and periods.
`orange-economy-v1.json` is the matching approved documentation/config snapshot;
no app code reads documentation. The simulation verifies both agree.

## Currency and product rules

- Oranges never expire. Inactivity removes nothing, creates no debt, and never
  resets active-day progress. There are no negative inactivity penalties.
- Currency buys cosmetics only, with no gameplay or fitness advantage.
- Never reward eating less, being below calorie target, skipping meals, weight
  loss, body-fat reduction, or low body weight. All body goals use identical rules.
- No daily weighing incentive. No requirement to perform every activity category.
  Extra entries, toggles, edits, and recreated records do not multiply rewards.
- Every user starts in a complete **free default outfit**: white ChebuFit shirt,
  dark athletic shorts, and standard ChebuFit sneakers. Oranges are never required
  for a complete appearance. Future purchases customize/replace individual pieces.
  This rule does not create wardrobe state or a catalog.

## Eligibility and calendar semantics

The producer supplies an already-qualified `activeDayQualified` event with category
`foodTracking`, `waterTracking`, or `completedWorkout`, plus a stable source ID.
Rewards does not import feature logic or decide food/water/workout eligibility.
Weight alone never creates an active day. One qualifying category suffices.
`plannedMealsCompleted` describes tracking the user's planned occasions, without
requiring a fixed number of meals or a particular amount eaten.

Welcome is +10 once per account lifetime, after a successful useful tracking grant
referenced by `qualifyingEventId`. Eligible references are ordinary tracking or
active-day grants, including weight logging; welcome/milestone grants do not qualify.
This does not turn weight-only use into an active day. App opening, onboarding,
and viewing Today are insufficient. Keep the welcome identity across reinstall.
The evaluator returns only the requested grant; it never emits secondary events.

Milestones count distinct local dates of retained `activeDayQualified` grants.
Dates may have gaps. Each configured threshold is lifetime-only; no annual restart,
consecutive streak, decay, or repair purchase exists. A candidate is ineligible
until history contains at least that many qualified dates. Additional thresholds
can be added to central rules later, without a new event type.

The caller supplies the original normalized local calendar day and retains it on
retries/edits. A week is **Monday–Sunday**, keyed by its Monday date, e.g.
2026-12-31 and 2027-01-03 both map to 2026-12-28; 2027-01-04 starts a new week.
`getLocalWeekStart` uses date-only arithmetic, not the UTC day of an event timestamp.
Processing time is separately supplied. Timezone changes must not relabel history.

## Economy baseline projections

Schedules repeat Monday–Sunday from a zero-balance new wallet. Today mock 248 is
excluded. Casual logs food 3 days, water goals 2, workouts 2, and weight 1/week;
Regular uses 6/5/3/2; Power uses 7/7/5/3. Overlap yields 4/6/7 active days/week.
Food entries and planned-meal completion differ explicitly in the JSON schedules.
Water goals are a conservative proxy for qualifying water activity in this model;
we do not invent extra water-only active days. Welcome and reached milestones are
included once. These are scenarios, not telemetry or guaranteed forecasts.

<!-- simulation:start -->
### Production rewards

| Event | Oranges | Cap |
| --- | --- | --- |
| mealLogged | 2 | 1 / localDay |
| plannedMealsCompleted | 1 | 1 / localDay |
| waterGoalCompleted | 2 | 1 / localDay |
| workoutCompleted | 3 | 1 / localDay |
| weightLogged | 1 | 1 / localWeek |
| activeDayQualified | 5 | 1 / localDay |
| welcomeReward | 10 | 1 / lifetime |
| activeDayMilestone | Milestones below | 1 / milestone |

### Baseline earnings (welcome and achieved milestones included once)

| Days | Casual | Regular | Power | Power/Casual |
| --- | --- | --- | --- | --- |
| 7 | 48 | 76 | 106 | 2.21x |
| 30 | 189 | 307 | 411 | 2.17x |
| 90 | 534 | 898 | 1183 | 2.22x |
| 365 | 2108 | 3567 | 4686 | 2.22x |

### Recurring income (excludes welcome and milestones)

| Profile | Per week | Per day | Normalized 30 days | Per active day |
| --- | --- | --- | --- | --- |
| Casual | 38 | 5.43 | 162.86 | 9.50 |
| Regular | 66 | 9.43 | 282.86 | 11.00 |
| Power | 86 | 12.29 | 368.57 | 12.29 |

### Approved store price guidance (not catalog items)

| Tier | Category | Approved range | Illustrative reference |
| --- | --- | --- | --- |
| 1 | tinyAccessory | 40–70 | 40 |
| 2 | accessory | 90–130 | 100 |
| 3 | standardClothing | 150–220 | 180 |
| 4 | premiumClothing | 280–400 | 360 |
| 5 | premiumOutfit | 500–700 | 600 |
| 6 | rareSpecial | 800–1100 | 1000 |

### Calendar days to save for one item from zero, no prior spending

| Profile | First 40 | Standard 180 | Premium 360 | Outfit 600 | Rare 1000 |
| --- | --- | --- | --- | --- | --- |
| Casual | 6 | 30 | 58 | 104 | 170 |
| Regular | 3 | 17 | 34 | 60 | 102 |
| Power | 3 | 13 | 28 | 46 | 78 |

### First week

| Profile | Without welcome | With welcome | First 40: without / with welcome (day) |
| --- | --- | --- | --- |
| Casual | 38 | 48 | 8 / 6 |
| Regular | 66 | 76 | 4 / 3 |
| Power | 96 | 106 | 4 / 3 |

### Lifetime active-day milestones

| Active days | Oranges once | Casual calendar day | Regular calendar day | Power calendar day |
| --- | --- | --- | --- | --- |
| 7 | 10 | 11 | 8 | 7 |
| 30 | 20 | 51 | 34 | 30 |
| 90 | 35 | 156 | 104 | 90 |
| 180 | 50 | 314 | 209 | 180 |
| 365 | 75 | 638 | 425 | 365 |

### Gross issuance and illustrative spending

Purchases (day → amount): 30 → 100; 60 → 180; 90 → 100; 180 → 360; 270 → 180; 365 → 600.

| Approx. months / days | Gross C / R / P | Spent to date | Wallets C / R / P |
| --- | --- | --- | --- |
| 1 / 30 | 189 / 307 / 411 | 100 | 89 / 207 / 311 |
| 3 / 90 | 534 / 898 / 1183 | 380 | 154 / 518 / 803 |
| 6 / 180 | 1049 / 1778 / 2338 | 740 | 309 / 1038 / 1598 |
| 12 / 365 | 2108 / 3567 / 4686 | 1520 | 588 / 2047 / 3166 |

### First-30-day sensitivity to starting weekday

| Profile | Range including bonuses |
| --- | --- |
| Casual | 179–189 |
| Regular | 294–308 |
| Power | 408–411 |

Fairness examples, recurring: nutrition-only **46/week** (6 food days);
training-focused **44/week** (3 workouts, 5 water-goal days).
Daily weighing earns **0 extra** over the modeled weekly rewarded weight log.

<!-- simulation:end -->

## Interpretation and boundaries

The recurring Power/Casual spread is about 2.3x, largely from 7 versus 4 active days,
not repetitive actions. Per active day the spread is about 1.3x. Nutrition-only and
training-focused scenarios remain viable; food/workout bonuses are subordinate
pieces rather than obligatory daily chores. Casual users can make an entry purchase
in their first modeled week. Welcome covers only 25% of the 40-orange entry item.

Price ranges are approved **guidelines**, not catalog prices. Reference prices in
the tables are illustrations only. Everyone already has a free complete outfit.
Saving times assume no earlier purchases; ordinary clothing should not be priced
like rare artwork. Rare items remain optional longer-term goals.

Positive saved balances are acceptable. A finite static catalog can eventually
saturate. Future optional permanent collections, backgrounds, poses, or cosmetic
seasonal themes can provide new choices without expiry, countdown pressure,
stat boosts, or compulsory spending. The spending scenario is illustrative, not
predicted buying behavior. No store or purchasing operation is implemented.

The TASK 12 provisional comparisons are superseded by these approved values and
ranges; historical tables remain available in Git history. No old production
aliases or data migration are needed because no real grants were persisted.

Future persistence must atomically enforce wallet-scoped reward identity uniqueness,
ledger insertion/balance updates, daily/weekly caps, welcome uniqueness, and milestone
uniqueness. Retain successful grants and original local-day/week attribution after
source deletion, edits, reinstall, and retries. Eligibility from producing features
still needs authoritative validation; this pure client domain is not a backend.

No UI action earns currency yet. Today still reads mock 248 from rewards and is
visually unchanged. There is no storage, auth, store, wardrobe, or animation work.

Reproduce with `node scripts/simulate-orange-economy.cjs`; `--write` refreshes the
calculated block. The script uses only Node built-ins, reads the production rule
literal, checks the approved JSON matches, checks known totals/caps/milestones,
and rejects stale report tables. Tests separately exercise the actual engine.
