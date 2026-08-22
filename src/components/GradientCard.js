/**
 * OVERLOAD GradientCard
 * Premium luxury tinted gradient card with warm palette
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import spacing, { radii } from '../theme/spacing';
import { triggerHaptic } from '../utils/haptics';

/* ── Luxury Palette ── */
const P = {
  border: '#E8E4DE',
};

export default function GradientCard({
  children,
  colors: gradientColors = ['#F5F2ED', '#EDE9E1'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  onPress,
  style,
  contentStyle,
  borderColor = P.border,
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

  return (
    <CardContainer
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress ? handlePress : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.cardOuter,
        { borderColor },
        style,
      ]}
      {...props}
    >
      <LinearGradient
        colors={gradientColors}
        start={start}
        end={end}
        style={[styles.gradientInner, contentStyle]}
      >
        {children}
      </LinearGradient>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  gradientInner: {
    padding: spacing.cardPadding,
  },
});
