# ChebuFit light design system

The light theme is warm, calm, and spacious: cream canvas, white cards, warm dark
text, selective orange emphasis, and restrained green feedback. This foundation
does not define the Today dashboard or any product data. Dark mode is deferred.

## Tokens

`src/shared/theme/tokens.ts` is the source of truth. Use semantic roles instead of
literal colors or copied component styles. Extend the token system when a genuine
repeated need appears; avoid adding arbitrary values to individual screens.

- **Color:** `background` is the cream canvas; `surface` is clean white;
  `surfaceSecondary` groups quiet content. `primary`/`primaryPressed` fill primary
  controls; `primaryText` is the stronger orange for readable text on light surfaces.
  `primarySubtle` is a restrained accent surface. Success and destructive roles
  include subtle surfaces. Use the three text roles for hierarchy, divider/border
  for necessary separation, and disabled roles only for unavailable controls.
- **Spacing:** 4, 8, 12, 16, 20, 24, 32, 40 points. Page inset 24, card inset 20,
  section gap 32. Smaller gaps establish relationships within components.
- **Radii:** 8 for small shapes, 16 for controls, 24 for cards. Full rounding is
  reserved for badges and circular icon controls.
- **Typography:** native system font; display 40/48, page 30/38, section 22/28,
  card 18/26, body 16/24, secondary body 14/21, label 14/20, caption 12/18,
  button 16/24 (size/line height). No custom font or fixed text-box heights.
- **Elevation:** cards use a low-opacity warm shadow and Android elevation 1.
  Surface contrast and whitespace supply most separation; do not stack shadows.
- **Motion:** fast 120 ms, standard 220 ms, slow 360 ms. Standard cubic intent is
  `[0.2, 0, 0, 1]`; enter eases out, exit eases in. These are conventions only.
  Future animations must respect Reduce Motion; none are added here.

## Primitives

Import components directly from `src/shared/ui`.

- `Screen`: safe-area canvas with page padding, readable maximum content width,
  and optional `scroll`. Headers/tabs already consume vertical space: pass
  `edges={['left', 'right']}` for tab content; standalone header screens also use
  the bottom edge. Avoid nesting a second vertical ScrollView inside a scroll Screen.
- `AppText`: typed typography and text-tone roles. Font scaling stays enabled.
  Page/section titles default to header semantics. Let body/button copy wrap.
- `Card`: white rounded surface; standard/compact/spacious/none padding and optional
  elevation. It does not make all children one accessibility element.
- `Button`: primary, secondary, ghost, destructive; an explicit press handler is
  required. Disabled/loading controls cannot be pressed. Loading retains its label
  and announces busy state; destructive labels must communicate the action.
- `Icon`/`IconButton`: Expo Symbols, SF Symbols on iOS and matching Material Symbols
  on Android. Icons are decorative; IconButton requires an accessible label.
- `ProgressBar`: determinate fraction from 0 to 1, clamped to bounds (NaN becomes
  zero; infinities saturate). Requires a label and exposes a 0–100 accessibility
  value. Pair with visible context/percentage when the value matters.
- `SectionHeader`: title and optional secondary action, with wrapping layout.
- `Metric`: domain-neutral label/value/unit/description. Callers format localized
  values and may supply a pronunciation-friendly accessibility label.
- `Badge`: noninteractive neutral/accent/positive status text, not a tiny button.
- `Divider`: quiet separation inside a surface, used sparingly.

ProgressRing is deferred: a clean circular stroke needs a drawing implementation
such as SVG. No dependency is added solely for a ring. Use ProgressBar for now.

## Accessibility and layout

Controls target at least 44 points; text buttons start at 52 points and grow for
wrapped/scaled labels. Text roles and primary/destructive button labels target at
least 4.5:1 contrast on their intended surfaces; disabled controls are exempt.
Keep full accessible tab names even if visual labels must fit a compact bar.
Selection has icon/text context and font-weight changes as well as orange color.
Status meanings need descriptive text, not color alone. Do not disable font scaling
or truncate ordinary content to make a layout fit. Actual VoiceOver interaction
should be reviewed alongside real product flows; these semantics are a foundation.

Use flex, wrapping rows, and content constraints rather than device dimensions.
Tab-bar height adapts to font scale and bottom inset; horizontal padding respects
asymmetric safe areas. No absolute/floating tab bar is introduced.

## Internal showcase

In development, the palette icon in Today's header opens `/design-system` outside
the four tabs. The root `Stack.Protected` guard excludes it from production
navigation/deep links. Expo Go URL: `exp://127.0.0.1:8081/--/design-system`.
The showcase has component states, typed system text, semantic swatches, and a
320-point page-width preview. Its sample numbers/copy are internal design examples,
not product functionality. Remove or evolve this internal tool when it stops helping.
