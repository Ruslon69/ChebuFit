# ChebuFit

Minimal Expo SDK 58, React Native, and TypeScript foundation for iOS and Android.
The app currently contains the unmodified blank-template screen.

## Development

Use Node.js 24 and npm. Install the locked dependencies with `npm ci`.

- `npm start`: start the Expo development server.
- `npm run ios`: start Expo and open an iOS Simulator.
- `npm run android`: start Expo and open an Android emulator.
- `npm run typecheck`: validate TypeScript without generating files.
- `npx expo install --check`: check dependency compatibility with the Expo SDK.

Simulator and emulator commands require the corresponding platform tools and a
compatible Expo Go installation. Native builds require additional native setup.

## Configuration

The display name is `ChebuFit` and the Expo slug is `chebufit`.
`com.chebufit.app` is a placeholder for both native application identifiers;
confirm ownership and final identifiers before configuring signing or releases.

Environment files, credentials, dependencies, and generated native projects are
excluded from Git. No backend, authentication, product features, or watchOS
target is configured.
