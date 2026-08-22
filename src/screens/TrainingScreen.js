/**
 * OVERLOAD TrainingScreen
 * Premium Luxury Light Theme — matching HomeScreen aesthetic
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import { TRAINING_CATEGORIES } from '../constants/categories';
import { ROUTES } from '../constants/routes';
import storageService from '../services/storageService';
import { useFocusEffect } from '@react-navigation/native';

/* ── Premium Luxury Palette ── */
const P = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F2ED',
  border: '#E8E4DE',

  navy: '#1B2A4A',
  navyLight: '#2C3E5A',
  navyMuted: 'rgba(27, 42, 74, 0.06)',
  navySoft: 'rgba(27, 42, 74, 0.10)',
  navyBorder: 'rgba(27, 42, 74, 0.12)',

  gold: '#C5A55A',
  goldLight: '#D4B96E',
  goldMuted: 'rgba(197, 165, 90, 0.10)',
  goldBorder: 'rgba(197, 165, 90, 0.25)',

  sage: '#6B8F71',
  sageMuted: 'rgba(107, 143, 113, 0.10)',

  rose: '#C4787A',
  roseMuted: 'rgba(196, 120, 122, 0.10)',

  text: '#1A1A2E',
  textSec: '#6B6B7B',
  textMuted: '#9E9EAE',
};

const SCREEN_PAD = 24;

export default function TrainingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [facultiesData, setFacultiesData] = React.useState({});

  useFocusEffect(
    React.useCallback(() => {
      storageService.getAllFaculties().then((data) => {
        if (data) setFacultiesData(data);
      });
    }, [])
  );

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 12
      : Math.max(insets.top, 20) + 8;

  const bottomPad = Math.max(insets.bottom, 20) + 20;

  const coreCategories = TRAINING_CATEGORIES.filter((c) => c.group === 'core');
  const advancedCategories = TRAINING_CATEGORIES.filter(
    (c) => c.group === 'advanced'
  );

  const handleCategoryPress = (category) => {
    navigation.navigate(ROUTES.CATEGORY_DETAIL, { categoryId: category.id });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} translucent />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPad, paddingHorizontal: SCREEN_PAD },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>COGNITIVE FACULTIES</Text>
            <Text style={styles.userName}>Training</Text>
          </View>
        </View>

        {/* ── INTRO CARD ── */}
        <LinearGradient
          colors={['#F5F2ED', '#EDE9E1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.introCard}
        >
          <View style={styles.introTopRow}>
            <View style={styles.introIconBox}>
              <Ionicons name="fitness-outline" size={24} color={P.navy} />
            </View>
            <View style={styles.introTextCol}>
              <Text style={styles.introTitle}>Train specific cognitive systems.</Text>
              <Text style={styles.introDesc}>
                Targeted drills calibrated to challenge and expand mental capacity.
              </Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>8</Text>
              <Text style={styles.quickStatLabel}>Faculties</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>4</Text>
              <Text style={styles.quickStatLabel}>Core</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>4</Text>
              <Text style={styles.quickStatLabel}>Advanced</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── CORE SYSTEMS ── */}
        <Text style={styles.sectionTitle}>Core Systems</Text>
        <Text style={styles.sectionSubtitle}>Fundamental cognitive building blocks</Text>
        <View style={styles.categoriesList}>
          {coreCategories.map((category) => {
            const fac = facultiesData[category.id];
            const liveLevel = fac?.level || category.level || 1;
            const liveMetric = fac?.metrics?.peakSpan
              ? `${fac.metrics.peakSpan} items`
              : (fac?.metrics?.accuracy ? `${fac.metrics.accuracy}%` : category.defaultMetric);

            return (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.75}
                onPress={() => handleCategoryPress(category)}
                style={styles.categoryCard}
                accessibilityLabel={`${category.name}, Level ${liveLevel}`}
              >
                <View style={styles.catRow}>
                  <View
                    style={[
                      styles.catIconBox,
                      { backgroundColor: `${category.accentColor || P.navy}12` },
                    ]}
                  >
                    <Ionicons
                      name={category.icon || 'cube-outline'}
                      size={22}
                      color={category.accentColor || P.navy}
                    />
                  </View>
                  <View style={styles.catTextCol}>
                    <View style={styles.catTitleRow}>
                      <Text style={styles.catName} numberOfLines={1}>
                        {category.name}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={P.textMuted} />
                    </View>
                    <Text style={styles.catDesc} numberOfLines={1}>
                      {category.tagline || category.description}
                    </Text>
                    <View style={styles.catMetaRow}>
                      <View
                        style={[
                          styles.catLevelBadge,
                          { borderColor: (category.accentColor || P.navy) + '30' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.catLevelText,
                            { color: category.accentColor || P.navy },
                          ]}
                        >
                          Level {liveLevel}
                        </Text>
                      </View>
                      <Text style={styles.catMetric}>{liveMetric}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── ADVANCED SYSTEMS ── */}
        <View style={{ marginTop: 32 }}>
          <Text style={styles.sectionTitle}>Advanced Systems</Text>
          <Text style={styles.sectionSubtitle}>
            Complex spatial logic and executive function
          </Text>
        </View>
        <View style={styles.categoriesList}>
          {advancedCategories.map((category) => {
            const fac = facultiesData[category.id];
            const liveLevel = fac?.level || category.level || 1;
            const liveMetric = fac?.metrics?.peakSpan
              ? `${fac.metrics.peakSpan} items`
              : (fac?.metrics?.accuracy ? `${fac.metrics.accuracy}%` : category.defaultMetric);

            return (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.75}
                onPress={() => handleCategoryPress(category)}
                style={styles.categoryCard}
                accessibilityLabel={`${category.name}, Level ${liveLevel}`}
              >
                <View style={styles.catRow}>
                  <View
                    style={[
                      styles.catIconBox,
                      { backgroundColor: `${category.accentColor || P.navy}12` },
                    ]}
                  >
                    <Ionicons
                      name={category.icon || 'cube-outline'}
                      size={22}
                      color={category.accentColor || P.navy}
                    />
                  </View>
                  <View style={styles.catTextCol}>
                    <View style={styles.catTitleRow}>
                      <Text style={styles.catName} numberOfLines={1}>
                        {category.name}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={P.textMuted} />
                    </View>
                    <Text style={styles.catDesc} numberOfLines={1}>
                      {category.tagline || category.description}
                    </Text>
                    <View style={styles.catMetaRow}>
                      <View
                        style={[
                          styles.catLevelBadge,
                          { borderColor: (category.accentColor || P.navy) + '30' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.catLevelText,
                            { color: category.accentColor || P.navy },
                          ]}
                        >
                          Level {liveLevel}
                        </Text>
                      </View>
                      <Text style={styles.catMetric}>{liveMetric}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: bottomPad }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: P.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  userName: {
    fontSize: 30,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.5,
  },

  /* ── Intro Card ── */
  introCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 20,
    marginBottom: 32,
    overflow: 'hidden',
  },
  introTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  introIconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: P.navyMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  introTextCol: {
    flex: 1,
  },
  introTitle: {
    fontSize: 17,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  introDesc: {
    fontSize: 13,
    color: P.textSec,
    lineHeight: 20,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: P.navyBorder,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatDivider: {
    width: 1,
    height: 22,
    backgroundColor: P.navyBorder,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: P.navy,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 12,
    color: P.textSec,
  },

  /* ── Section Headers ── */
  sectionTitle: {
    fontSize: 21,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: P.textSec,
    marginBottom: 16,
  },

  /* ── Categories ── */
  categoriesList: {
    gap: 10,
  },
  categoryCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 16,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  catIconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  catTextCol: {
    flex: 1,
  },
  catTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  catName: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: P.text,
    flex: 1,
    marginRight: 8,
  },
  catDesc: {
    fontSize: 13,
    color: P.textSec,
    lineHeight: 18,
    marginBottom: 8,
  },
  catMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  catLevelText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  catMetric: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: P.textSec,
  },
});
