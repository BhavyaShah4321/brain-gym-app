/**
 * OVERLOAD Unified Theme
 */

import colors from './colors';
import typography from './typography';
import { spacing, radii, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  cardRadius: radii.card,
  buttonRadius: radii.button,
  screenPadding: spacing.screenPadding,
  sectionSpacing: spacing.sectionSpacing,
  cardPadding: spacing.cardPadding,
  animation: {
    quick: 150,
    normal: 250,
    smooth: 350,
  },
};

export default theme;
