/**
 * OVERLOAD CategoryCard
 * Premium luxury category card with warm palette
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import { triggerHaptic } from '../utils/haptics';

/* ── Luxury Palette ── */
const P = {
  surface: '#FFFFFF',
  border: '#E8E4DE',
  text: '#1A1A2E',
  textSec: '#6B6B7B',
  textMuted: '#9E9EAE',
  navy: '#1B2A4A',
};

export default function CategoryCard({
  category,
  onPress,
  style,
}) {
  const handlePress = () => {
    triggerHaptic('light');
    if (onPress) onPress(category);
  };

  const accent = category.accentColor || P.navy;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={[styles.card, style]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${category.name}, Level ${category.level || 1}, ${category.tagline}`}
    >
      <View style={styles.cardRow}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: `${accent}12` },
          ]}
        >
          <Ionicons
            name={category.icon || 'cube-outline'}
            size={22}
            color={accent}
          />
        </View>

        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {category.name}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={P.textMuted} />
          </View>

          <Text style={styles.description} numberOfLines={1}>
            {category.tagline || category.description}
          </Text>

          <View style={styles.metaRow}>
            <View style={[styles.levelBadge, { borderColor: `${accent}30` }]}>
              <Text style={[styles.levelText, { color: accent }]}>
                Level {category.level || 1}
              </Text>
            </View>
            <Text style={styles.metricText}>
              {category.defaultMetric}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 16,
    marginVertical: 5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: P.text,
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    color: P.textSec,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
    color: P.textSec,
  },
});
