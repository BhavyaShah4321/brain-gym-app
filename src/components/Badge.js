/**
 * OVERLOAD Badge Component
 * Premium luxury status/metric tag pill with warm palette
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';

/* ── Luxury Palette ── */
const P = {
  navy: '#1B2A4A',
  navyMuted: 'rgba(27, 42, 74, 0.06)',
  navyBorder: 'rgba(27, 42, 74, 0.12)',
  gold: '#C5A55A',
  goldMuted: 'rgba(197, 165, 90, 0.10)',
  goldBorder: 'rgba(197, 165, 90, 0.25)',
  sage: '#6B8F71',
  sageMuted: 'rgba(107, 143, 113, 0.10)',
  sageBorder: 'rgba(107, 143, 113, 0.25)',
  rose: '#C4787A',
  roseMuted: 'rgba(196, 120, 122, 0.10)',
  roseBorder: 'rgba(196, 120, 122, 0.25)',
  border: '#E8E4DE',
  surfaceAlt: '#F5F2ED',
  textSec: '#6B6B7B',
  textMuted: '#9E9EAE',
};

export default function Badge({
  label,
  variant = 'default',
  color,
  size = 'md',
  style,
  textStyle,
}) {
  const getBadgeColors = () => {
    if (color) {
      return {
        bg: `${color}12`,
        border: `${color}30`,
        text: color,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          bg: P.navyMuted,
          border: P.navyBorder,
          text: P.navy,
        };
      case 'gold':
        return {
          bg: P.goldMuted,
          border: P.goldBorder,
          text: P.gold,
        };
      case 'sage':
      case 'success':
        return {
          bg: P.sageMuted,
          border: P.sageBorder,
          text: P.sage,
        };
      case 'rose':
      case 'danger':
        return {
          bg: P.roseMuted,
          border: P.roseBorder,
          text: P.rose,
        };
      case 'outline':
        return {
          bg: P.surfaceAlt,
          border: P.border,
          text: P.textSec,
        };
      default:
        return {
          bg: P.surfaceAlt,
          border: P.border,
          text: P.textSec,
        };
    }
  };

  const badgeTheme = getBadgeColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSm && styles.badgeSm,
        {
          backgroundColor: badgeTheme.bg,
          borderColor: badgeTheme.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSm && styles.textSm,
          { color: badgeTheme.text },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 10,
    letterSpacing: 0,
  },
});
