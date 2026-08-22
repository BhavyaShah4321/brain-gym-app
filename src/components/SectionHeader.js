/**
 * OVERLOAD SectionHeader
 * Premium luxury section heading with warm palette
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

export default function SectionHeader({
  title,
  subtitle,
  rightAction,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textColumn}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {rightAction ? (
        <View style={styles.rightActionWrapper}>{rightAction}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: spacing.xxl,
  },
  textColumn: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B6B7B',
    marginTop: 3,
  },
  rightActionWrapper: {
    marginLeft: spacing.sm,
  },
});
