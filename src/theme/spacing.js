/**
 * OVERLOAD Design System - Spacing and Layout Tokens
 */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  screenPadding: 20,
  cardPadding: 18,
  sectionSpacing: 28,
};

export const radii = {
  xs: 6,
  sm: 10,
  small: 10,
  md: 14,
  medium: 14,
  button: 16,
  lg: 20,
  large: 20,
  card: 20,
  xl: 24,
  hero: 24,
  pill: 9999,
  full: 9999,
};

export const shadows = {
  subtle: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  card: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
};

export default {
  spacing,
  radii,
  shadows,
};
