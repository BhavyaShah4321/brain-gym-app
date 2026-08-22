/**
 * OVERLOAD EmptyState
 * Premium luxury placeholder with warm palette
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import AppButton from './AppButton';

export default function EmptyState({
  iconName = 'cube-outline',
  title = 'No Data Available',
  description = 'Complete training drills to record cognitive performance telemetry.',
  actionTitle,
  onActionPress,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={26} color="#6B6B7B" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onActionPress ? (
        <AppButton
          title={actionTitle}
          onPress={onActionPress}
          variant="secondary"
          size="sm"
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: radii.pill,
    backgroundColor: '#F5F2ED',
    borderWidth: 1,
    borderColor: '#E8E4DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.bodySmall,
    color: '#6B6B7B',
    textAlign: 'center',
    lineHeight: typography.lineHeights.bodySmall,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: spacing.md,
  },
});
