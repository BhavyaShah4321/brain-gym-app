/**
 * OVERLOAD AppButton
 * Premium luxury button with warm palette and refined gradients
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import { triggerHaptic } from '../utils/haptics';

/* ── Luxury Palette ── */
const P = {
  navy: '#1B2A4A',
  navyLight: '#2C3E5A',
  gold: '#C5A55A',
  goldLight: '#D4B96E',
  border: '#E8E4DE',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F2ED',
  text: '#1A1A2E',
  textSec: '#6B6B7B',
  textMuted: '#9E9EAE',
  textInverse: '#FFFFFF',
  danger: '#C4787A',
  dangerDark: '#A86062',
};

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}) {
  const handlePress = (e) => {
    if (disabled || loading) return;
    triggerHaptic(variant === 'primary' ? 'medium' : 'light');
    if (onPress) onPress(e);
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [P.navy, P.navyLight];
      case 'gold':
        return [P.gold, P.goldLight];
      case 'danger':
        return [P.danger, P.dangerDark];
      default:
        return null;
    }
  };

  const gradientColors = getGradientColors();

  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
          indicatorColor: P.text,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
          indicatorColor: P.navy,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
          indicatorColor: P.textInverse,
        };
      case 'gold':
        return {
          container: styles.goldContainer,
          text: styles.goldText,
          indicatorColor: P.textInverse,
        };
      case 'primary':
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          indicatorColor: P.textInverse,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: styles.smContainer,
          text: styles.smText,
        };
      case 'lg':
        return {
          container: styles.lgContainer,
          text: styles.lgText,
        };
      case 'md':
      default:
        return {
          container: styles.mdContainer,
          text: styles.mdText,
        };
    }
  };

  const variantStyle = getButtonStyles();
  const sizeStyle = getSizeStyles();

  const buttonContent = (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.indicatorColor}
        />
      ) : (
        <>
          {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
          <Text
            style={[
              styles.baseText,
              variantStyle.text,
              sizeStyle.text,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
        </>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
      style={[
        styles.baseContainer,
        sizeStyle.container,
        !gradientColors && variantStyle.container,
        disabled && styles.disabledContainer,
        style,
      ]}
      {...props}
    >
      {gradientColors && !disabled ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientWrapper, sizeStyle.container]}
        >
          {buttonContent}
        </LinearGradient>
      ) : (
        buttonContent
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: radii.button,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradientWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconWrapper: {
    marginRight: spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: spacing.sm,
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Variants
  primaryContainer: {
    backgroundColor: '#1B2A4A',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4DE',
  },
  secondaryText: {
    color: '#1A1A2E',
    fontWeight: '600',
  },
  goldContainer: {
    backgroundColor: '#C5A55A',
  },
  goldText: {
    color: '#FFFFFF',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#1B2A4A',
    fontWeight: '600',
  },
  dangerContainer: {
    backgroundColor: '#C4787A',
  },
  dangerText: {
    color: '#FFFFFF',
  },

  // Sizes
  smContainer: {
    height: 38,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  smText: {
    fontSize: typography.sizes.bodySmall,
  },
  mdContainer: {
    height: 50,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.button,
  },
  mdText: {
    fontSize: typography.sizes.bodyLarge,
  },
  lgContainer: {
    height: 56,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.button,
  },
  lgText: {
    fontSize: typography.sizes.bodyLarge + 1,
  },

  // Disabled
  disabledContainer: {
    opacity: 0.45,
    backgroundColor: '#F5F2ED',
  },
  disabledText: {
    color: '#9E9EAE',
  },
});
