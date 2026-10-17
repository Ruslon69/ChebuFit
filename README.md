# ChebuFit

Minimal Expo SDK 58, React Native, and TypeScript foundation for iOS and Android.
Today renders a mock-backed daily dashboard; the other three tabs and onboarding
remain placeholders. See
[ARCHITECTURE.md](./ARCHITECTURE.md) for source organization and dependency rules.
The warm light-theme primitives and usage rules are documented in
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md). During development, long-press Today's
profile control to open the internal design-system showcase; it is not a tab.

## Development

Use Node.js 24 and npm. Install the locked dependencies with `npm ci`.

- `npm start`: start the Expo development server.
- `npm run ios`: start Expo and open an iOS Simulator.
- `npm run android`: start Expo and open an Android emulator.
- `npm run typecheck`: validate TypeScript without generating files.
- `npx expo install --check`: check dependency compatibility with the Expo SDK.

Navigation uses Expo Router. On a fresh checkout, start Expo once to generate its
ignored route types before running the TypeScript check. The development UI uses
Russian labels: Сегодня, Питание, Тренировки, Прогресс. `/onboarding` is a separate
placeholder flow; real onboarding/authentication gating will be added later.

Simulator and emulator commands require the corresponding platform tools and a
compatible Expo Go installation. Native builds require additional native setup.

## Configuration

The display name is `ChebuFit` and the Expo slug is `chebufit`.
`com.chebufit.app` is a placeholder for both native application identifiers;
confirm ownership and final identifiers before configuring signing or releases.

Environment files, credentials, dependencies, and generated native projects are
excluded from Git. No backend, authentication, persistence, or watchOS target is configured.
