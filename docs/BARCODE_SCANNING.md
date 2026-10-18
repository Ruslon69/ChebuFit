# Barcode discovery

Reviewed Expo SDK 58 documentation and installed native source on 2026-10-18.
`expo-camera ~58.0.10` is the first-party SDK-compatible dependency, installed
with `expo install`. `CameraView` supplies barcode callbacks; the deprecated
standalone barcode scanner package is not used. No other direct dependency.

## Contract and shared flow

Add Food opens `/scan-food?date=YYYY-MM-DD&meal=...`. Both parameters are validated
using the existing diary route parser and captured for the route lifetime. Back or
Search by name returns to the existing Add Food screen, preserving its query and
context. A found product opens the existing `FoodSelectionSheet`, with 100g default,
domain-derived quantity preview and meal selection. A committed Add dismisses back
to the existing Nutrition route. Historical diary date is never inferred again;
the existing reward producer separately captures the current local action day.

`domain/barcode.ts` is provider-independent. `BarcodeLookupController` receives a
`FoodCatalogProvider`; it owns async discovery states, not navigation, storage or
reward rules. Native presentation calls the existing singleton provider's
`getByBarcode`, so OFF mapping, identification, timeout and cooldown are unchanged.
Found food uses the same Add operation as search: snapshot → diary commit → eligible
reward batch → recent snapshot → one feedback. Scan, lookup, permission, failure,
view and cancel grant nothing and create no Recent. Corrections remain possible;
wallet identities prevent delete/re-add farming. Not-found/incomplete products can open the personal-food editor with the normalized
lookup code and captured context. Personal catalog matches resolve locally before OFF;
see `../src/features/personal-foods/README.md`.

## Formats and normalization

Camera settings permit only `ean13`, `ean8`, `upc_a`, `upc_e`; QR is excluded both
in settings and validation. Input remains a string, with outer whitespace trimmed.
Accept 8/12/13/14 digits (EAN/UPC and provider-compatible GTIN-14); reject embedded
spaces, non-digits, all-zero or unsupported lengths. Do not parse as Number or
strip meaningful leading zeroes. No extra checksum rejection is imposed on OFF's
lookup port.

Apple AVFoundation reports UPC-A under EAN-13 with a leading zero. **Expo Camera
58.0.10's installed iOS `BarcodeScannerUtils.normalizeBarcodeValue` strips that
zero before its JS callback.** Accept the resulting 12-digit value even when the
callback type is `ean13`; preserve the string the SDK supplies. Manual input keeps
its leading zero. Recheck this behavior when upgrading Expo Camera.

A camera-identified UPC-E is expanded deterministically to UPC-A for lookup while
retaining its original display code. A manual eight-digit code defaults to EAN-8;
an explicit UPC-E checkbox permits the same expansion (number system 0/1). Never
guess whether an untyped eight-digit string is EAN-8 or compressed UPC-E.

## Permissions, availability and lifecycle

Opening the route checks permission but never immediately prompts. Explain camera
use, then request on Allow. Checking/requestable/granted/denied/non-requestable
states are explicit. A denial offers manual entry and name search; a permanent
one additionally offers Settings. Refresh permission on foreground return.

Expo configuration sets the Russian `NSCameraUsageDescription`, disables the
plugin's microphone permission and Android audio recording, and blocks merged
`RECORD_AUDIO`. No photo-library permission is added. Introspected iOS metadata
contains camera usage only, with no microphone or photo-library usage descriptions.
These settings require a new native build to affect a distributed binary; Expo Go
uses its host binary's existing permission descriptions.

Preview mounts only while focused, foreground, granted, available, not manually
entering a code and idle. It unmounts during lookup, found selection, route blur
and background. Rear camera, torch off, no recording/capture calls. There is no
flashlight or haptic dependency. The rectangle is a visual guide, not a claimed
native scan region. Native mount errors or a 10-second camera-ready deadline offer
manual fallback. Availability is checked with `isAvailableAsync` on web only:
this SDK's installed native module does not implement that static method.

## Locking, errors and accessibility

Accepting a valid code synchronously sets `lookingUp` **before** awaiting anything.
Repeated same/different callbacks are ignored until explicit reset. Found remains
locked, with one selection. Blur/background aborts the request and invalidates
late generations; returning never retries automatically. Closing selection permits
another scan. Retry and rescan never bypass the provider's existing rate gates.

A genuine null product is not-found; incomplete nutrition, network, timeout,
server and rate-limit errors stay separate. Invalid manual input makes zero
requests. Retry is deliberate and disabled until a provider cooldown expires.
No fake nutrition or automatic retry loop. Manual entry is always reachable without
camera access, uses a numeric string field, labeled actions and keyboard-aware
scrolling. The same normalizer/controller handles camera and manual input. States
have accessible text/announcements; controls retain shared touch-target and Dynamic
Type conventions. There is no focus trap or inaccessible camera-only requirement.

## Privacy and validation

Camera frames stay on-device inside Expo/native barcode recognition. No frame,
photo or video is captured, persisted or uploaded by ChebuFit. Only the normalized
barcode plus existing public lookup context/ordinary network metadata is sent to
OFF. No diary, wallet or profile data accompanies lookup. Existing OFF attribution,
license and Privacy Policy obligations remain in `OPEN_FOOD_FACTS.md` and
`DATA_SOURCES.md`.

`npm run test:scanner` uses deterministic fixtures, fake providers and injected
clocks. It covers formats/zeroes/UPC-E, duplicate locks, cancellation, permission
and lifecycle policy, error/cooldown separation, historical context, shared preview,
Add persistence, Recents and existing rewards/anti-farm. No test requires live OFF
or physically granting permission.

Native visual/manual validation uses iPhone Duo / iOS 27.1, screenshots under
`.artifacts/screenshots/task-21/`. Known live code `5011157888101` resolves to Tilda
Pure Basmati rice; the existing selection shows 143 kcal/100g and rounded 358
kcal/250g, then commits a detached snapshot through the shared Add operation.
Permission explanation, the native Expo Go camera prompt and the denied/settings
fallback were inspected; permission/lifecycle variants are fixture-tested. This headless Xcode installation
has CoreSimulator but no Simulator GUI, so an explicit Allow tap and a
live preview were not manually verified. Manual keyboard input was visually
checked after a simulator restart, including maximum accessibility text. Error,
not-found and rate-limit screenshots use controlled provider responses; the loading
capture delays the already fetched product without another OFF request.
The simulator has no useful optical camera source. **No physical iPhone is
connected: real optical recognition and device-specific camera performance are
not verified.** Callback lock tests and simulator/manual lookup do not substitute
for that final device check. No fake camera preview is generated.

## Primary references

- [Expo SDK 58 Camera API/configuration](https://docs.expo.dev/versions/v58.0.0/sdk/camera/)
- [Apple TN2325: barcode formats and UPC-A](https://developer.apple.com/library/archive/technotes/tn2325/_index.html)
- Installed `expo-camera/ios/Current/BarcodeScannerUtils.swift` (SDK normalization).
- [ZXing UPC-E interpretation reference](https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/oned/UPCEReader.java)
