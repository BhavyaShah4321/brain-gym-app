/**
 * OVERLOAD Design System - Typography Tokens
 */

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'sans-serif',
});

const monoFontFamily = Platform.select({
  ios: 'Courier',
  android: 'monospace',
  default: 'monospace',
});

export const typography = {
  fontFamily,
  monoFontFamily,

  sizes: {
    display: 34,
    hero: 30,
    h1: 26,
    h2: 20,
    h3: 17,
    bodyLarge: 15,
    body: 14,
    bodySmall: 13,
    caption: 12,
    micro: 11,
    statNumber: 26,
    scoreNumber: 42,
    percentage: 42,
  },

  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },

  letterSpacing: {
    tight: -0.4,
    normal: 0,
    wide: 0.3,
    wider: 0.8,
    caps: 1.2,
    display: 1.5,
  },

  lineHeights: {
    display: 40,
    hero: 36,
    h1: 32,
    h2: 26,
    h3: 22,
    bodyLarge: 22,
    body: 20,
    bodySmall: 18,
    caption: 16,
    micro: 14,
  },
};

export default typography;
