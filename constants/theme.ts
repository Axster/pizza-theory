/**
 * Tema centralizzato di Pizza Theory.
 * Definisce i token di colore per la modalità chiara e scura e i due temi
 * React Native Paper (MD3) pronti per essere selezionati dinamicamente in
 * base al color-scheme del dispositivo.
 */

import { Platform } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// ─── Brand colors ────────────────────────────────────────────────────────────
const PRIMARY   = '#FF6347'; // Tomato red
const SECONDARY = '#FFA500'; // Orange

// ─── Paper themes ────────────────────────────────────────────────────────────

/** Tema scuro — usato quando il dispositivo è in Dark Mode */
export const PizzaDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary:    PRIMARY,
    secondary:  SECONDARY,
    background: '#121212',
    surface:    '#1E1E1E',
    surfaceVariant: '#2A2A2A',
  },
};

/** Tema chiaro — usato quando il dispositivo è in Light Mode */
export const PizzaLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary:    PRIMARY,
    secondary:  SECONDARY,
    background: '#F5F5F5',
    surface:    '#FFFFFF',
    surfaceVariant: '#EEEEEE',
  },
};

// ─── Legacy color tokens (usati da use-theme-color.ts) ───────────────────────
export const Colors = {
  light: {
    text: '#11181C',
    background: '#F5F5F5',
    tint: PRIMARY,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: PRIMARY,
  },
  dark: {
    text: '#ECEDEE',
    background: '#121212',
    tint: PRIMARY,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: PRIMARY,
  },
};

// ─── Font stack per piattaforma ──────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
