/**
 * OVERLOAD AppCard
 * Premium luxury surface card with warm palette
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import spacing, { radii, shadows } from '../theme/spacing';
import { triggerHaptic } from '../utils/haptics';

/* ── Luxury Palette ── */
const P = {
  surface: '#FFFFFF',
  surfaceAlt: '#F5F2ED',
  border: '#E8E4DE',
};

export default function AppCard({
  children,
  onPress,
  variant = 'primary',
  accentColor,
  active = false,
  style,
  contentStyle,
  accessibilityLabel,
  ...props
}) {
  const CardContainer = onPress ? TouchableOpacity : View;

  const handlePress = (e) => {
    if (onPress) {
      triggerHaptic('light');
      onPress(e);
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return P.surfaceAlt;
      case 'highlight':
        return '#F0EDE6';
      case 'primary':
      default:
        return P.surface;
    }
  };

  const getBorderColor = () => {
    if (active && accentColor) return accentColor;
    if (active) return '#1B2A4A';
    return P.border;
  };

  return (
    <CardContainer
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress ? handlePress : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        style,
      ]}
      {...props}
    >
      {accentColor && (
        <View
          style={[
            styles.accentBar,
            { backgroundColor: accentColor },
          ]}
        />
      )}
      <View style={[styles.innerContent, contentStyle]}>
        {children}
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: spacing.xs,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
  },
  innerContent: {
    padding: spacing.cardPadding,
  },
});
