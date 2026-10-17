# ChebuFit architecture

## Responsibilities

- `App.tsx` delegates to `src/app/AppRoot.tsx`; `index.ts` keeps Expo registration.
- `src/app` composes the application, future navigation/providers, and feature use
  cases. It chooses concrete adapters and passes them to the code that needs them.
- `src/features/{onboarding,profile,nutrition,water,workouts,progress}` owns each
  product domain. The feature READMEs define ownership before implementation.
- `src/shared/ui` contains reusable, product-neutral React Native components.
- `src/shared/theme` contains temporary design tokens, with no React dependency.
- `src/shared/config` exposes non-secret application defaults. The display name
  comes from `app.json` so native and JavaScript configuration stay aligned.
- `src/shared/i18n` holds typed messages. The application chooses the locale and
  supplies text to presentation components. Move selection into an app provider
  when user/device locale selection is implemented; add pluralization and formatting
  tooling when real localized features need it. Never translate stored domain IDs.
- `src/shared/utils` and `src/shared/types` document homes for genuinely shared
  pure helpers/contracts. They have no speculative implementations yet.
- `src/infrastructure` is reserved for concrete external adapters. Root `assets/`
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
Offline persistence and sync policy will be designed with the first persisted
feature; there is no database or generic repository abstraction yet.

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

The root renders a temporary development placeholder using shared layout, tokens,
and messages. There are no feature implementations, service clients, navigation,
storage, authentication, or watch target. Add concrete abstractions with their first
consumer instead of filling each documented layer in advance.
