/**
 * OVERLOAD IconButton
 * Premium luxury icon button with warm palette
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing, { radii } from '../theme/spacing';
import { triggerHaptic } from '../utils/haptics';

/* ── Luxury Palette ── */
const P = {
  surface: '#FFFFFF',
  border: '#E8E4DE',
  navy: '#1B2A4A',
  navyMuted: 'rgba(27, 42, 74, 0.06)',
  navyBorder: 'rgba(27, 42, 74, 0.12)',
  text: '#1A1A2E',
  textSec: '#6B6B7B',
  textInverse: '#FFFFFF',
};

export default function IconButton({
  name,
  size = 20,
  color = P.text,
  onPress,
  variant = 'surface',
  accessibilityLabel,
  style,
  ...props
}) {
  const handlePress = (e) => {
    triggerHaptic('light');
    if (onPress) onPress(e);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'primary':
        return {
          backgroundColor: P.navy,
          borderWidth: 0,
        };
      case 'border':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: P.border,
        };
      case 'surface':
      default:
        return {
          backgroundColor: P.surface,
          borderWidth: 1,
          borderColor: P.border,
        };
    }
  };

  const variantStyle = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || name}
      style={[
        styles.button,
        variantStyle,
        style,
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      {...props}
    >
      <Ionicons
        name={name}
        size={size}
        color={variant === 'primary' ? P.textInverse : color}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.sm,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
