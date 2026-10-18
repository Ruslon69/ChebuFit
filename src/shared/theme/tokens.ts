import type { TextStyle, ViewStyle } from 'react-native';

export const lightColors = {
  background: '#F8F5EF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1ECE5',
  primary: '#EA7025',
  primaryPressed: '#E2691D',
  primarySubtle: '#FFF0E5',
  primaryText: '#B64A08',
  onPrimary: '#2B241F',
  onDestructive: '#FFFFFF',
  primarySubtlePressed: '#FCEBDD',
  success: '#386B4C',
  successSubtle: '#EAF2E9',
  text: '#2B241F',
  textSecondary: '#71655B',
  textTertiary: '#796D62',
  border: '#DDD5CA',
  divider: '#EAE3D9',
  destructive: '#B44235',
  destructivePressed: '#96372C',
  destructiveSubtle: '#FAECE8',
  disabledSurface: '#EAE5DE',
  disabledText: '#776B60',
  shadow: '#3A2B20',
  scrim: 'rgba(43, 36, 31, 0.28)',
} as const;

export type ColorRole = keyof typeof lightColors;

const typography = {
  display: { fontSize: 40, lineHeight: 48, fontWeight: '600', fontVariant: ['tabular-nums'] },
  pageTitle: { fontSize: 30, lineHeight: 38, fontWeight: '700' },
  sectionTitle: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  cardTitle: { fontSize: 18, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySecondary: { fontSize: 14, lineHeight: 21, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '400' },
  button: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export const tokens = {
  colors: lightColors,
  spacing: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 32, page: 24, spacious: 40 },
  radii: { small: 8, control: 16, card: 24, pill: 999 },
  typography,
  elevation: {
    flat: {},
    card: {
      shadowColor: lightColors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.075,
      shadowRadius: 14,
      elevation: 2,
    },
  } satisfies Record<string, ViewStyle>,
  size: { touchTarget: 44, button: 52, floatingControl: 56, tabBar: 64, iconSmall: 16, icon: 22, iconLarge: 28, progress: 8, swatch: 36 },
  stroke: { thin: 1 },
  opacity: { pressed: 0.72, disabled: 0.4 },
  accessibility: { headingTextScale: 1.6, bodyTextScale: 2, controlTextScale: 1.8 },
  layout: { contentMaxWidth: 640, compactWidth: 320, modalMaxHeight: '90%' },
  motion: {
    duration: { fast: 120, standard: 220, slow: 360 },
    easing: { standard: [0.2, 0, 0, 1], enter: 'ease-out', exit: 'ease-in' },
  },
} as const;
