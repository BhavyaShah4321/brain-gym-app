/**
 * OVERLOAD Header
 * Premium luxury editorial header with warm palette
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import { triggerHaptic } from '../utils/haptics';

/* ── Luxury Palette ── */
const P = {
  navy: '#1B2A4A',
  navyMuted: 'rgba(27, 42, 74, 0.06)',
  navyBorder: 'rgba(27, 42, 74, 0.12)',
  border: '#E8E4DE',
  text: '#1A1A2E',
  textSec: '#6B6B7B',
};

export default function Header({
  title,
  subtitle,
  onBackPress,
  rightAction,
  dashboardMode = false,
  onAvatarPress,
  onNotificationPress,
  style,
}) {
  const handleBack = () => {
    triggerHaptic('light');
    if (onBackPress) onBackPress();
  };

  if (dashboardMode) {
    return (
      <View style={[styles.dashboardContainer, style]}>
        <View style={styles.titleWrapper}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>Operator</Text>
        </View>

        <View style={styles.dashboardRightRow}>
          {onNotificationPress && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('light');
                onNotificationPress();
              }}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={styles.iconButton}
            >
              <Ionicons name="notifications-outline" size={20} color={P.textSec} />
            </TouchableOpacity>
          )}

          {onAvatarPress ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('light');
                onAvatarPress();
              }}
              accessibilityRole="button"
              accessibilityLabel="Operator profile"
              style={styles.avatarButton}
            >
              <Ionicons name="person" size={18} color={P.navy} />
            </TouchableOpacity>
          ) : rightAction ? (
            <View style={styles.rightActionWrapper}>{rightAction}</View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftColumn}>
        {onBackPress ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={20} color={P.text} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleWrapper}>
          {subtitle && <Text style={styles.subtitle}>{subtitle.toUpperCase()}</Text>}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>

      {rightAction && <View style={styles.rightActionWrapper}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  dashboardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },
  leftColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.sizes.bodySmall,
    color: '#6B6B7B',
    fontWeight: typography.weights.medium,
    marginBottom: 3,
  },
  userName: {
    fontSize: 30,
    fontWeight: typography.weights.bold,
    color: '#1A1A2E',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    color: '#1B2A4A',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  dashboardRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(27, 42, 74, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(27, 42, 74, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActionWrapper: {
    marginLeft: spacing.md,
  },
});
