/**
 * Centralized Pizza Theory theme.
 * Colors extracted from official mockups (design-home-dark.png / design-home-light.jpg).
 */

import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// ─── Brand colors ────────────────────────────────────────────────────────────
export const BRAND_RED    = '#C62828';   // carmine red — button, accents
export const BRAND_RED_LT = '#E53935';   // lighter red
export const BRAND_ORANGE = '#FF8A65';   // warm orange (secondary)

// ─── Dark Palette ────────────────────────────────────────────────────────────
const DARK_BG       = '#141414';  // main background (darker than surface)
const DARK_SURFACE  = '#2C2C2C';  // card, drawer, TextInput
const DARK_SURFACE2 = '#383838';  // surface variant

// ─── Light Palette ───────────────────────────────────────────────────────────
const LIGHT_BG      = '#EDE8E3';  // warm ivory cream
const LIGHT_SURFACE = '#FFFFFF';  // card, drawer
const LIGHT_SURFACE2= '#F2EFEB';  // surface variant

// ─── Paper Themes ────────────────────────────────────────────────────────────

/** Dark theme — Dark Mode */
export const PizzaDarkTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary (button, accents)
    primary:              BRAND_RED,
    onPrimary:            '#FFFFFF',         // ← white text on the button
    primaryContainer:     '#7B1515',
    onPrimaryContainer:   '#FFFFFF',
    // Secondary (SegmentedButton checked)
    secondary:            BRAND_ORANGE,
    onSecondary:          '#FFFFFF',
    secondaryContainer:   BRAND_RED,         // ← active tab background for SegmentedButton
    onSecondaryContainer: '#FFFFFF',         // ← white text on the active tab
    // Surfaces
    background:           DARK_BG,
    surface:              DARK_SURFACE,
    surfaceVariant:       DARK_SURFACE2,
    onBackground:         '#FFFFFF',
    onSurface:            '#ECECEC',
    onSurfaceVariant:     '#AAAAAA',
    // Borders
    outline:              '#484848',
    outlineVariant:       '#3A3A3A',
  },
};

/** Light theme — Light Mode */
export const PizzaLightTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary:              BRAND_RED,
    onPrimary:            '#FFFFFF',
    primaryContainer:     '#FFCDD2',
    onPrimaryContainer:   '#7B0000',
    secondary:            BRAND_ORANGE,
    onSecondary:          '#FFFFFF',
    secondaryContainer:   BRAND_RED,
    onSecondaryContainer: '#FFFFFF',
    background:           LIGHT_BG,
    surface:              LIGHT_SURFACE,
    surfaceVariant:       LIGHT_SURFACE2,
    onBackground:         '#1A1A1A',
    onSurface:            '#1A1A1A',
    onSurfaceVariant:     '#555555',
    outline:              '#C0B8B0',
    outlineVariant:       '#DAD5D0',
  },
};

// ─── Legacy color tokens ─────────────────────────────────────────────────────
export const Colors = {
  light: { text: '#1A1A1A', background: LIGHT_BG, tint: BRAND_RED, icon: '#687076', tabIconDefault: '#687076', tabIconSelected: BRAND_RED },
  dark:  { text: '#ECECEC', background: DARK_BG,  tint: BRAND_RED, icon: '#9BA1A6', tabIconDefault: '#9BA1A6', tabIconSelected: BRAND_RED },
};

// ─── Slider colors ────────────────────────────────────────────────────────────
export const SliderColors = {
  tempGradient: ['#F5C842', '#E8502A', '#C0392B'] as string[],
  hydration:    '#42A5F5',
  strength:      BRAND_RED,
};
