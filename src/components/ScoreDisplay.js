/**
 * OVERLOAD ScoreDisplay
 * Premium luxury cognitive score visualizer with warm palette
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

export default function ScoreDisplay({
  score,
  label = 'COGNITIVE READINESS',
  description,
  accentColor = '#1B2A4A',
  size = 'lg',
  style,
}) {
  const isXl = size === 'xl';
  const isMd = size === 'md';

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={styles.label}>{label.toUpperCase()}</Text>
      ) : null}

      <View style={styles.scoreRow}>
        <Text
          style={[
            styles.scoreText,
            isXl && styles.scoreTextXl,
            isMd && styles.scoreTextMd,
            { color: accentColor },
          ]}
        >
          {score}
        </Text>
      </View>

      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B6B7B',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -1,
  },
  scoreTextXl: {
    fontSize: 52,
    lineHeight: 58,
  },
  scoreTextMd: {
    fontSize: 32,
    lineHeight: 38,
  },
  description: {
    fontSize: 13,
    color: '#6B6B7B',
    textAlign: 'center',
    marginTop: spacing.xxs,
  },
});
