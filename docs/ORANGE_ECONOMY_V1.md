# ChebuFit orange economy v1 — proposal

Decision proposal only. Production rules, reward integrations, and Today's mock
248 are unchanged. These are scenario calculations, not measured user forecasts.

## Product principles

- Oranges never expire. Missing a day never removes currency or creates debt.
- No rewards for eating less, being below a calorie target, losing weight,
  reducing body fat, or skipping meals. Goals for fat loss, maintenance, and muscle
  gain have identical currency rules.
- Useful engagement earns optional cosmetic currency, with no functional advantage.
- Casual use must show progress. More active users earn moderately faster;
  repeated entries, edits, toggles, and extra weigh-ins must not multiply earnings.
- Purchases should create anticipation without daily chores. No streak-reset
  warnings, daily deadlines, expiring balances, or scarcity countdowns.

## Model and definitions

All schedules repeat Monday–Sunday; a new wallet starts at zero on Monday.
The existing Today display of 248 is excluded. Days 30/90/180/365 approximate
1/3/6/12 months; the script also checks all seven starting weekdays for month-one
sensitivity. Integer grants are exact; averages are rounded to two decimals.

Casual logs food on Mon/Thu/Sat, trains Tue/Sat, and is active four days/week.
Regular logs Mon–Sat and trains Tue/Thu/Sat. Power logs daily and trains five
days/week. Power weighs three times/week, not automatically every day. Complete
tracking days are explicitly modeled separately from food days in the baseline.
Detailed arrays and all assumptions are in `orange-economy-v1.json`.

For the current rules only, interpret the unspecified streak qualification as
seven consecutive active days, rewarded once per continuous streak. Thus Casual
and Regular get no streak bonus in these schedules; Power gets one +15 at day 7,
not +15 every week. Qualification does not yet exist in production.

For the proposal, an **active day** means a real meal log, personalized water-goal
completion, or completed workout. Any one qualifies; doing all three is unnecessary.
Opening the app or logging weight alone does not qualify. `dailyTrackingCompleted`
becomes this inclusive base reward; that is an eligibility change requiring later
implementation, not merely changing a number. `dailyMealsCompleted` means logging
all user-planned meal occasions, with no fixed count or calorie/intake outcome.

## Calculated tables

<!-- simulation:start -->
### Weekly input scenarios (counts, before caps)

| Profile | Food days / meal slots | Meals complete | Water | Workouts | Weight | Complete tracking | Active days |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Casual | 3 / 7 | 1 | 2 | 2 | 1 | 1 | 4 |
| Regular | 6 / 19 | 4 | 5 | 3 | 2 | 4 | 6 |
| Power | 7 / 22 | 7 | 7 | 5 | 3 | 7 | 7 |

### Current earnings (includes qualified current streak bonus)

| Days | Profile | Earned | Average/day | Average/week |
| --- | --- | --- | --- | --- |
| 7 | Casual | 52 | 7.43 | 52.00 |
| 7 | Regular | 127 | 18.14 | 127.00 |
| 7 | Power | 206 | 29.43 | 206.00 |
| 30 | Casual | 225 | 7.50 | 52.50 |
| 30 | Regular | 548 | 18.27 | 127.87 |
| 30 | Power | 839 | 27.97 | 195.77 |
| 90 | Casual | 676 | 7.51 | 52.58 |
| 90 | Regular | 1651 | 18.34 | 128.41 |
| 90 | Power | 2479 | 27.54 | 192.81 |
| 365 | Casual | 2708 | 7.42 | 51.93 |
| 365 | Regular | 6623 | 18.15 | 127.02 |
| 365 | Power | 9978 | 27.34 | 191.36 |

### Profile spread and legitimate current ceiling

| Days | Regular − Casual | Power − Casual | Power/Casual | 33/day + one qualified 15 |
| --- | --- | --- | --- | --- |
| 7 | 75 | 154 | 3.96x | 246 |
| 30 | 323 | 614 | 3.73x | 1005 |
| 90 | 975 | 1803 | 3.67x | 2985 |
| 365 | 3915 | 7270 | 3.68x | 12060 |

The last column assumes a legitimate uninterrupted streak. It is not the absolute
engine-enforced maximum: fresh unverified streak IDs are currently uncapped.


### Recommended reward values (proposal only)

| Event | Current | Proposed | Proposed cap | Reason |
| --- | --- | --- | --- | --- |
| mealLogged | 2 | 2 | 1/day | First meal log only; additional food entries do not multiply income |
| dailyMealsCompleted | 5 | 1 | 1/day | Small optional completeness bonus, without a required meal count |
| waterGoalCompleted | 3 | 2 | 1/day | A useful but optional personalized goal |
| workoutCompleted | 10 | 3 | 1/day | Recognize training without making it dominate |
| weightLogged | 2 | 1 | 1/day; 1/local week | No extra currency for daily weighing |
| dailyTrackingCompleted | 5 | 5 | 1/day | An inclusive active-day base, not an all-features checklist |
| streakMilestone | 15 | 10 / 20 / 35 / 50 / 75 | Lifetime thresholds below | Cumulative active days; no reset |

### Proposed earnings (includes welcome and achieved lifetime milestones)

| Days | Casual | Regular | Power | Power/Casual |
| --- | --- | --- | --- | --- |
| 7 | 48 | 76 | 106 | 2.21x |
| 30 | 189 | 307 | 411 | 2.17x |
| 90 | 534 | 898 | 1183 | 2.22x |
| 365 | 2108 | 3567 | 4686 | 2.22x |

### Price ladder (orange ranges; categories only, no catalog)

| Tier | Category | Range | Reference price |
| --- | --- | --- | --- |
| 1 | tinyAccessory | 40–70 | 40 |
| 2 | accessory | 90–130 | 100 |
| 3 | standardClothing | 160–220 | 180 |
| 4 | premiumClothing | 300–450 | 360 |
| 5 | premiumOutfit | 600–850 | 720 |
| 6 | rareSpecial | 1000–1400 | 1200 |

### Calendar days to afford one item from zero (no previous purchases)

| Economy | Profile | First 40 | Standard 180 | Premium 360 | Outfit 720 | Rare 1200 |
| --- | --- | --- | --- | --- | --- | --- |
| Current | Casual | 6 | 27 | 48 | 97 | 162 |
| Current | Regular | 2 | 10 | 20 | 40 | 67 |
| Current | Power | 2 | 7 | 13 | 26 | 44 |
| Proposed + welcome | Casual | 6 | 30 | 58 | 125 | 207 |
| Proposed + welcome | Regular | 3 | 17 | 34 | 72 | 120 |
| Proposed + welcome | Power | 3 | 13 | 28 | 56 | 92 |

### First-week experience

| Profile | Current week 1 | Proposed without welcome | Proposed with 10 welcome | Day to 40 without/with welcome |
| --- | --- | --- | --- | --- |
| Casual | 52 | 38 | 48 | 8 / 6 |
| Regular | 127 | 66 | 76 | 4 / 3 |
| Power | 206 | 96 | 106 | 4 / 3 |

### Lifetime active-day milestones (calendar day reached in each schedule)

| Active days | Oranges once | Casual | Regular | Power |
| --- | --- | --- | --- | --- |
| 7 | 10 | 11 | 8 | 7 |
| 30 | 20 | 51 | 34 | 30 |
| 90 | 35 | 156 | 104 | 90 |
| 180 | 50 | 314 | 209 | 180 |
| 365 | 75 | 638 | 425 | 365 |

### Currency creation / inflation (gross; before purchases)

| Approx. months / days | Current C / R / P | Proposed C / R / P |
| --- | --- | --- |
| 1 / 30 | 225 / 548 / 839 | 189 / 307 / 411 |
| 3 / 90 | 676 / 1651 / 2479 | 534 / 898 / 1183 |
| 6 / 180 | 1321 / 3269 / 4929 | 1049 / 1778 / 2338 |
| 12 / 365 | 2708 / 6623 / 9978 | 2108 / 3567 / 4686 |

### Illustrative spending and proposed remaining wallets

Purchase schedule: day 30 → 100; 60 → 180; 90 → 100; 180 → 360;
270 → 180; 365 → 720. Each is within its tier range. All are affordable.

| Days | Spent to date | Casual wallet | Regular wallet | Power wallet |
| --- | --- | --- | --- | --- |
| 30 | 100 | 89 | 207 | 311 |
| 90 | 380 | 154 | 518 | 803 |
| 180 | 740 | 309 | 1038 | 1598 |
| 365 | 1640 | 468 | 1927 | 3046 |

### Fairness and steady recurring income (excludes one-time bonuses)

| Profile | Per week | Per day | Normalized 30 days | Per active day | Food % | Workout % | Weight % |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Casual | 38 | 5.43 | 162.86 | 9.50 | 18.42 | 15.79 | 2.63 |
| Regular | 66 | 9.43 | 282.86 | 11.00 | 24.24 | 13.64 | 1.52 |
| Power | 86 | 12.29 | 368.57 | 12.29 | 24.42 | 17.44 | 1.16 |

Normalized 30-day income is the recurring weekly rate × 30/7, excluding welcome
and milestones. Actual calendar-month totals vary with weekday mix and milestones.


Nutrition-only (6 food days, 4 complete): **46/week**.
Training-focused (3 workouts, 5 water goals, no food/weight): **44/week**.
Workouts only (3 active days, no other tracking): **24/week**.
Daily weighing instead of the Power schedule earns **0 extra** under the weekly cap.


### Starting-weekday sensitivity: first 30 days

| Profile | Current range | Proposed range including welcome/milestones |
| --- | --- | --- |
| Casual | 212–239 | 179–189 |
| Regular | 527–560 | 294–308 |
| Power | 827–841 | 408–411 |
<!-- simulation:end -->

## Product interpretation

### Recommended v1 and fairness

Use the proposed values and price ranges above after approval, with a one-time
10-orange welcome credit on the first useful tracking day. Reward only the first
meal log each day, keep completeness a small optional bonus, reduce workout
dominance, and reward at most one weight entry per Monday-based local week.
Missing weeks do not bank or remove entitlements. The same weight source must
remain deduplicated across weeks; the weekly cap is additional to stable identity.

The recurring Power/Casual income ratio falls from about 3.7x to about 2.3x.
Much of the remaining difference comes from seven versus four active days, not
repetitive actions: per active day, the proposed spread is only about 1.3x.
Food and workouts no longer dominate Regular earnings; the active-day base is
the largest component. Weight contributes little and daily weighing earns no
more than one weekly log. Nutrition-only and training-focused scenarios remain
close, and skipping weight entirely has only a one-orange/week effect.

Do not qualify bonuses using calorie deficits, target adherence, weight change,
or a compulsory workout/weigh-in checklist. Completion is optional and must never
imply that skipping a meal is financially rewarded.

### First week, milestones, and time to purchase

Keep at least one appealing entry accessory at 40. Welcome 10 covers only 25%
of it; normal use supplies the rest. No body data or repeated onboarding needed.
All three modeled profiles can buy it in week one, even though Casual earns no
7-active-day milestone yet. The displayed mock 248 must not silently become a
real opening grant. A zero-balance production wallet needs its own migration.

Choose **7 cumulative active days**, not seven consecutive calendar days.
Missed days pause progress without resetting it. Thresholds 7/30/90/180/365 grant
10/20/35/50/75 respectively, once each per wallet lifetime (190 total). Do not
restart the ladder annually or pay each seven-day block. No penalty, comeback
debt, or streak-repair purchase. Beyond 365 active days, review real behavior
before adding more payouts.

Time-to-purchase assumes saving from zero for that one item, without earlier
purchases. A saved balance of 248 would obscure the first-week test. Standard
items take several weeks for Casual users; premium clothes about two months.
A premium outfit is a multi-month goal; the rare item is intentionally much
longer. Roughly seven months for Casual rare saving is the upper comfortable
edge of this proposal, not a target for ordinary wardrobe items. Do not put
ordinary clothing at rare prices. The rare range's 1,400 upper end takes Casual
about eight months; reserve it for exceptional optional artwork, never basic
customization. Prior purchases extend all these timelines. Workouts-only use earns
less per week because it has three active days, but about the same per active day
as nutrition-only use.

### Inflation and optional sinks

Gross issuance and remaining wallet balance are different. The shared illustrative
purchase schedule spends 1,640 over a year on six purchases, checked for
affordability at each date for every profile. It is a sensitivity scenario, not a
predicted buying habit. Users can save instead: positive unspent balances are fine.

The current rules issue currency much faster against these prices. Under the
proposal, Power still saves several premium items' worth after the same purchases.
A small fixed catalog would eventually be exhausted under any nonexpiring positive
income system. Price hikes or expiry are not the solution. Offer occasional
permanent cosmetic collections, backgrounds, mascot poses, and optional seasonal
themes; rotate discovery without countdown pressure or loss of ownership.
Keep low-price choices available. No paid power, loot boxes, stat boosts, or
necessary purchases. Tune future supply using observed earn/spend and ownership
data rather than assuming these schedules are telemetry.

## Implementation boundaries and concerns

No proposed rules execute in the app. The existing engine cannot yet enforce the
new weekly weight cap, lifetime active-day counting, welcome identity, or action
qualification. Those need an approved follow-up and atomic persistent identities
before real reward integration. Lifetime thresholds must use wallet + threshold,
not a resettable user-supplied streak ID; retain identities across reinstall,
source deletion, edits, and retries. Count original local days/weeks, not server
processing time, and preserve attribution across timezone changes.

The finite baseline maximum assumes legitimate uninterrupted activity and a
qualified one-off 7-day milestone. The current engine has **no daily product cap
on distinct streak grants** if arbitrary fresh streak IDs are accepted: its null
streak cap and absent qualification admit repeated distinct candidates. Its
safe-integer overflow guard is a numeric boundary, not a meaningful economy cap.
Do not interpret
the modeled maximum as an anti-abuse guarantee. This is documented, not fixed
in TASK 12; production rules remain untouched.

Reproduce/check with `node scripts/simulate-orange-economy.cjs`.
`--write` refreshes only the calculated table block from the proposal JSON.
The dependency-free script checks the production-rule snapshot, known weekly
totals, local-week caps, milestone uniqueness, first-affordability dates, and
purchase affordability. The default command fails if report tables are stale.
