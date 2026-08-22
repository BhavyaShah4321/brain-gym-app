/**
 * OVERLOAD DifficultyBadge
 * Premium luxury difficulty indicator with warm palette
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';

export default function DifficultyBadge({
  level = 1,
  maxLevel = 5,
  accentColor = '#1B2A4A',
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Level {level}</Text>
      <View style={styles.dotsRow}>
        {Array.from({ length: maxLevel }).map((_, i) => {
          const isActive = i < level;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: isActive ? accentColor : '#E8E4DE',
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    backgroundColor: '#F5F2ED',
    borderWidth: 1,
    borderColor: '#E8E4DE',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B6B7B',
    letterSpacing: 0.3,
    marginRight: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
