# ChebuFit architecture

## Responsibilities

- `expo-router/entry` registers the app; `src/app/_layout.tsx` composes its root
  stack and application-level providers. Keep only routes/layouts in `src/app`
  because Expo Router treats other files there as routes too.
- `src/app` owns navigation and cross-domain screen composition. Feature screens
  live with their feature and are exposed through thin route wrappers. Future
  application composition will choose adapters and supply them to use cases.
- `src/features/{onboarding,profile,nutrition,water,workouts,progress,rewards}` owns each
  product domain. `src/features/today` composes the daily overview presentation from
  a typed `TodayViewModel` and mock dashboard fixture. The route supplies real
  wallet/water state through their application hooks. Successful water adds expose
  a persisted goal-crossing fact; composition processes rewards. Initial loading
  shows unavailable values, never fake zeroes.
- `src/features/rewards/domain` owns pure event evaluation, configurable rewards,
  stable local-day/week and lifetime identities, caps, qualified active-day
  milestones, welcome eligibility, and integer ledger calculation. Its public
  `index.ts` exposes contracts and a separate mock fixture. See its `README.md`
  for identity rules and the future atomic persistence requirements. Approved
  amounts and pricing guidance are documented in `docs/ORANGE_ECONOMY_V1.md`.
- `src/features/rewards/application` owns the wallet schema, repository port, and
  serialized wallet service. No React/native/storage SDK imports belong there.
- `src/features/water/domain` owns pure integer quantities and transitions; its
  `application/` owns versioned daily state, the repository port and serialized
  service. No React/native/storage SDK imports belong in either layer.
- `src/application` composes AsyncStorage wallet/water adapters, services and React hooks,
  alongside application UI shared across routes such as the Quick Add preview modal. Keep it outside the file-based route directory.
- `src/shared/ui` contains reusable, product-neutral React Native components.
- `src/shared/theme` contains semantic light-theme design tokens, with no runtime React dependency.
- `src/shared/config` exposes non-secret application defaults. The display name
  comes from `app.json` so native and JavaScript configuration stay aligned.
- `src/shared/i18n` holds typed messages. `useMessages` selects the configured
  locale centrally; Russian is the current development default. Move selection into an app provider
  when user/device locale selection is implemented; add pluralization and formatting
  tooling when real localized features need it. Never translate stored domain IDs.
- `src/shared/utils` and `src/shared/types` document homes for genuinely shared
  pure helpers/contracts. Shared local-calendar capture and validation live here.
- `src/infrastructure/{rewards,water}` implements feature repositories through narrow
  key-value ports, supplied with AsyncStorage in application composition. Other
  `src/infrastructure` integrations are added when needed. Root `assets/`
  continues to hold Expo app icons; future exercise media belongs with workouts.

## Dependency direction

Application composition depends on features, shared code, and concrete adapters.
Within an implemented feature, presentation calls application operations; those
operations depend on domain rules and feature-owned interfaces. Infrastructure
implements these interfaces and may depend on service/platform SDKs. Domain and
application logic must not import infrastructure implementations or React Native.
Shared code must not import features or infrastructure.

Keep models, validation, calculations, and invariants in pure TypeScript beside
their feature. As a feature grows, use `domain/`, `application/`, and `ui/` folders
only when they have real contents. Add explicit public exports when other features
need them. Cross-domain workflows belong in application composition or explicit
feature contracts, avoiding cycles and imports of another feature's internals.
For now use relative imports; no alias tooling or generic service framework is needed.

## External services and persistence

Define a narrow interface in the consuming feature when an operation first needs
product lookup, authentication, or storage. Implement Supabase, food-provider, or
local-storage adapters in infrastructure. Pass implementations explicitly from the
application layer. Map SDK objects and wire formats at the boundary; do not scatter
network calls or platform APIs through domain code or UI components.

Client configuration is public in a mobile bundle. Keep server secrets out of
client code and Expo configuration even when their source `.env` file is ignored.
The orange wallet is the first local persisted feature: one schema-v1 JSON record
per demo/real namespace, with canonical ledger plus an explicit demo seed. There is
no database, generic repository base class, or cloud sync policy. Its in-process
queue protects local operations; future backend writes must enforce identity, caps,
ledger, and balance updates atomically. Local storage is not a security boundary.

## Domain constraints to carry forward

- Nutrition diary entries preserve the nutrient snapshot used when logged,
  together with serving quantity and units. Source product updates do not change
  historical diary values.
- Exercise media supports ordered static key-position images first and an
  optional animation asset. Renderers choose how to display media; adding animation
  should extend the media description without replacing the exercise model.
- Workouts own platform-neutral session identity and rules. Future native watchOS
  code will exchange versioned, serializable session data/events through a watch
  adapter, using the same logical session IDs as mobile persistence/backend sync.
  Map transport payloads at the boundary. Design retries, deduplication, offline
  behavior, and conflict resolution with the session model before building sync.
  The watch companion will not depend on React Native screens or JavaScript objects;
  a language-neutral contract can be implemented in both TypeScript and Swift.

## Current scope

The root renders a four-tab navigation shell and a separate onboarding placeholder.
Shared visual primitives follow `DESIGN_SYSTEM.md`. The internal `src/development`
showcase is reachable through a development-only route/header control, outside tabs.
Today uses illustrative dashboard data from `src/features/today/model/todayMock.ts`.
Water is real per-day state consumed through `src/application/water/useDailyWater`
and persisted by the Water service; Today owns no canonical water quantity. The Today
header uses CHEBU-02 (`mascotAssets.greeting`) as decorative artwork in its bounded
profile-side column. Its orange balance is asynchronously reconstructed from the
local wallet. Development uses an explicit 248 demo opening credit and empty ledger;
real-mode wallets start at zero in a separate namespace. The first integrated reward action is a Today water-goal transition. Application
composition commits water/active-day/welcome credits in order and shows one
notice for the actual positive total. Presentation policy selects a brief micro
toast for ordinary grants, or a compact CHEBU-07 celebration when newly granted
welcome/milestone credits are present. Both are nonmodal and dismissible. Other feature actions and the store
remain unconnected.
Meals/history open existing tabs; workout/profile and Quick Add actions remain
unconnected previews.
Water uses versioned daily records with integer ml and historical goal snapshots,
separate from the wallet. Both use the existing AsyncStorage adapter pattern and
serialize local operations; cross-device/feature atomicity is not provided. See
`src/features/water/README.md` for the explicit-date API and future Watch contract.
No other product persistence, network service clients, authentication, or watch target exists.
Add concrete abstractions with their first consumer instead of filling each
documented layer in advance.

## Navigation

Expo Router owns file-based deep links and generated route types. Its JavaScript
tabs provide the four primary sections, with a native root stack for other flows:

```text
src/app/
  _layout.tsx            root stack; initial route is (tabs)
  (tabs)/
    _layout.tsx         four explicitly declared tabs
    index.tsx           Today at /
    nutrition.tsx       /nutrition
    workouts.tsx        /workouts
    progress.tsx        /progress
  onboarding.tsx        /onboarding, outside the tab shell
  design-system.tsx     development-only visual review, outside the tab shell
```

The app currently opens Today. Onboarding is independently reachable by deep link
and its temporary continue action returns to Today; it does not record completion.
When onboarding/auth state exists, introduce root `Stack.Protected` guards and an
explicit loading state. Those guards must gate both tab routes and protected
detail/modal routes, including incoming deep links. They do not replace backend
authorization. No fake onboarding or authentication state is introduced now.

Add profile/settings, add-food, scanner, product details, active workout, exercise
details, weight entry, and measurement entry as root stack routes when their
features are built. For example, `product/[productId]` and `workout/[sessionId]`
receive IDs; feature application operations load the data. Modal entry/scanner
flows can set `presentation: 'modal'` on their root stack screen. Profile will open
from the header/avatar, while scanner and quick-add actions will launch flows;
none of these becomes a fifth tab. Create a nested stack inside a tab only when
it needs its own navigation history.

Navigator headers and the in-flow tab bar own vertical safe areas; tab placeholders
apply horizontal safe areas. Today owns its top safe area with the navigator header
hidden. The tab scene reserves a small action lane above the bar so global Quick Add never
covers card content. Standalone onboarding also applies the bottom inset.
Avoid an absolute-positioned tab bar unless content explicitly accounts for it.
`Screen` uses safe-area-context and allows explicit edges for other layouts.

Set `scheme: 'chebufit'` for future native deep links. Until a native build includes
that scheme, test Expo Go using `exp://127.0.0.1:8081/--/onboarding` and equivalent
paths. Typed routes are generated into ignored `.expo/types` when Expo starts;
start Expo once before type checking a fresh checkout. Keep the generated types
and `expo-env.d.ts` in TypeScript's include list and out of Git.

Expo Router pulls in `react-dom` transitively. Its version is pinned to the installed
React version via an npm override so optional web peers cannot select an incompatible
newer renderer. Revisit the pin alongside a future Expo/React upgrade; no web UI or
additional direct web dependency is introduced here.
