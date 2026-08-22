/**
 * OVERLOAD StatCard
 * Premium luxury metric card with warm palette
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';

/* ── Luxury Palette ── */
const P = {
  surface: '#FFFFFF',
  border: '#E8E4DE',
  text: '#1A1A2E',
  textSec: '#6B6B7B',
};

export default function StatCard({
  value,
  label,
  sublabel,
  iconName = 'analytics-outline',
  accentColor = '#1B2A4A',
  style,
}) {
  return (
    <View
      style={[styles.card, style]}
      accessibilityLabel={`${label}: ${value}`}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: `${accentColor}14` },
        ]}
      >
        <Ionicons name={iconName} size={18} color={accentColor} />
      </View>

      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>

      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>

      {sublabel ? (
        <Text style={styles.sublabel} numberOfLines={1}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 16,
    marginVertical: 6,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: P.text,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: P.textSec,
  },
  sublabel: {
    fontSize: 11,
    color: '#9E9EAE',
    marginTop: 2,
  },
});
