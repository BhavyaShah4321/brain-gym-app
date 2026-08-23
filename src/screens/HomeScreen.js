/**
 * OVERLOAD HomeScreen
 * Premium Luxury Light Theme — Connected to Local Storage & Live Performance Telemetry
 */

import React, { useEffect, useState, useCallback } from 'react';
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
import { usePlayer } from '../context';
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

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { playerProfile, refreshProfile } = usePlayer();
  const [facultiesData, setFacultiesData] = useState({});

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 12
      : Math.max(insets.top, 20) + 8;

  const bottomPad = Math.max(insets.bottom, 20) + 20;

  // Refresh user data & faculty records whenever Home is focused
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      storageService.getAllFaculties().then((data) => {
        if (data) setFacultiesData(data);
      });
    }, [refreshProfile])
  );

  const handleCategoryPress = (category) => {
    navigation.navigate(ROUTES.CATEGORY_DETAIL, { categoryId: category.id });
  };

  const handleStartQuickDrill = () => {
    navigation.navigate(ROUTES.GAME, {
      categoryId: 'memory',
      mode: 'sequence_recall',
    });
  };

  // Derive real statistics with zero-state fallbacks
  const stats = playerProfile?.stats || {};
  const totalDrills = stats.totalDrills || 0;
  const displayName = playerProfile?.displayName || 'Operator';

  const readinessPercent = totalDrills > 0 ? (stats.readiness || 0) : 0;
  const readinessLabel = totalDrills > 0 ? `${readinessPercent}%` : 'Calibrating';
  const readinessStatus = totalDrills > 0 ? (readinessPercent >= 85 ? 'Optimal' : 'Calibrated') : 'Baseline';

  const streakValue = `${stats.currentStreak || 0} days`;
  const drillsValue = `${totalDrills}`;
  const indexValue = totalDrills > 0 ? `${stats.cognitiveIndex || 0}` : '—';
  const accuracyValue = totalDrills > 0 ? `${stats.averageAccuracy || 0}%` : '—';

  // Sub-domain metrics (live from faculty records or fallback)
  const memoryFaculty = facultiesData['memory']?.metrics;
  const memoryAccuracy = memoryFaculty?.accuracy
    ? `${memoryFaculty.accuracy}%`
    : (totalDrills > 0 && stats.averageAccuracy ? `${stats.averageAccuracy}%` : '—');
  const focusFaculty = facultiesData['focus']?.metrics;
  const focusAccuracy = focusFaculty?.accuracy
    ? `${focusFaculty.accuracy}%`
    : (facultiesData['focus']?.totalSessions > 0 ? `${focusFaculty?.score || 90}%` : (totalDrills > 0 ? 'Calibrating' : '—'));
  const speedFaculty = facultiesData['reaction']?.metrics;
  const speedAccuracy = speedFaculty?.averageLatency
    ? `${speedFaculty.averageLatency} ms`
    : (speedFaculty?.accuracy
        ? `${speedFaculty.accuracy}%`
        : (facultiesData['reaction']?.totalSessions > 0 ? 'Calibrated' : (totalDrills > 0 ? 'Calibrating' : '—')));

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
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate(ROUTES.SETTINGS)}
              style={styles.headerIconBtn}
              accessibilityLabel="Settings"
            >
              <Ionicons name="notifications-outline" size={20} color={P.textSec} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ProfileTab')}
              style={[styles.headerIconBtn, styles.headerAvatarBtn]}
              accessibilityLabel="Profile"
            >
              <Ionicons name="person" size={18} color={P.navy} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── READINESS HERO ── */}
        <LinearGradient
          colors={['#F5F2ED', '#EDE9E1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>COGNITIVE READINESS</Text>
              <Text style={styles.heroScore}>{readinessLabel}</Text>
            </View>
            <View style={styles.optimalBadge}>
              <Text style={styles.optimalText}>{readinessStatus}</Text>
            </View>
          </View>

          <Text style={styles.heroDesc}>
            {totalDrills > 0
              ? 'Performance calibrated across your completed training sessions.'
              : 'Complete your first training drill to initialize cognitive readiness telemetry.'}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: totalDrills > 0 ? `${Math.min(100, readinessPercent)}%` : '0%' },
              ]}
            />
          </View>

          {/* Sub-metrics */}
          <View style={styles.subMetrics}>
            <View style={styles.subMetricItem}>
              <Text style={styles.subMetricLabel}>Memory</Text>
              <Text style={styles.subMetricValue}>{memoryAccuracy}</Text>
            </View>
            <View style={styles.subMetricDivider} />
            <View style={styles.subMetricItem}>
              <Text style={styles.subMetricLabel}>Focus</Text>
              <Text style={styles.subMetricValue}>{focusAccuracy}</Text>
            </View>
            <View style={styles.subMetricDivider} />
            <View style={styles.subMetricItem}>
              <Text style={styles.subMetricLabel}>Speed</Text>
              <Text style={styles.subMetricValue}>{speedAccuracy}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── SECTION: Performance Overview ── */}
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatBox
              value={streakValue}
              label="Current Streak"
              icon="flame-outline"
              accent={P.gold}
              accentBg={P.goldMuted}
            />
            <StatBox
              value={drillsValue}
              label="Total Drills"
              icon="checkmark-circle-outline"
              accent={P.navy}
              accentBg={P.navyMuted}
            />
          </View>
          <View style={styles.statsRow}>
            <StatBox
              value={indexValue}
              label="Cognitive Index"
              icon="trending-up-outline"
              accent={P.sage}
              accentBg={P.sageMuted}
            />
            <StatBox
              value={accuracyValue}
              label="Mean Accuracy"
              icon="analytics-outline"
              accent={P.rose}
              accentBg={P.roseMuted}
            />
          </View>
        </View>

        {/* ── SECTION: Recommended Training ── */}
        <Text style={styles.sectionTitle}>Recommended Training</Text>
        <Text style={styles.sectionSubtitle}>Adaptive protocol selected for today</Text>

        <View style={styles.recommendedCard}>
          <View style={styles.recTopRow}>
            <View style={styles.recLeft}>
              <View style={styles.recIconBox}>
                <Ionicons name="cube-outline" size={20} color={P.navy} />
              </View>
              <View>
                <Text style={styles.recTitle}>Working Memory</Text>
                <Text style={styles.recMeta}>Sequence Recall · Tier 1</Text>
              </View>
            </View>
            <View style={styles.recTimeBadge}>
              <Text style={styles.recTimeText}>~90 sec</Text>
            </View>
          </View>

          <Text style={styles.recDesc}>
            Train your working-memory capacity with a short adaptive sequence challenge.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStartQuickDrill}
            style={styles.startBtn}
            accessibilityLabel="Start Training"
          >
            <LinearGradient
              colors={[P.navy, P.navyLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startBtnInner}
            >
              <Text style={styles.startBtnText}>Start Training</Text>
              <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── SECTION: Cognitive Faculties ── */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Cognitive Faculties</Text>
            <Text style={styles.sectionSubtitle}>8 core cognitive performance domains</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TrainingTab')}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesList}>
          {TRAINING_CATEGORIES.slice(0, 4).map((cat) => {
            const facultyRecord = facultiesData[cat.id];
            const liveLevel = facultyRecord?.level || cat.level || 1;
            const liveMetric = cat.id === 'reaction'
              ? (facultyRecord?.metrics?.averageLatency ? `${facultyRecord.metrics.averageLatency} ms` : cat.defaultMetric)
              : (cat.id === 'processing' || cat.id === 'decision')
              ? (facultyRecord?.metrics?.accuracy ? `${facultyRecord.metrics.accuracy}%` : cat.defaultMetric)
              : (facultyRecord?.metrics?.peakSpan
                  ? `${facultyRecord.metrics.peakSpan} items`
                  : (facultyRecord?.metrics?.accuracy ? `${facultyRecord.metrics.accuracy}%` : cat.defaultMetric));

            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.75}
                onPress={() => handleCategoryPress(cat)}
                style={styles.categoryCard}
                accessibilityLabel={`${cat.name}, Level ${liveLevel}`}
              >
                <View style={styles.catRow}>
                  <View style={[styles.catIconBox, { backgroundColor: `${cat.accentColor || P.navy}12` }]}>
                    <Ionicons
                      name={cat.icon || 'cube-outline'}
                      size={22}
                      color={cat.accentColor || P.navy}
                    />
                  </View>
                  <View style={styles.catTextCol}>
                    <View style={styles.catTitleRow}>
                      <Text style={styles.catName} numberOfLines={1}>
                        {cat.name}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={P.textMuted} />
                    </View>
                    <Text style={styles.catDesc} numberOfLines={1}>
                      {cat.tagline || cat.description}
                    </Text>
                    <View style={styles.catMetaRow}>
                      <View style={[styles.catLevelBadge, { borderColor: (cat.accentColor || P.navy) + '30' }]}>
                        <Text style={[styles.catLevelText, { color: cat.accentColor || P.navy }]}>
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

/* ── Inline StatBox component ── */
function StatBox({ value, label, icon, accent, accentBg }) {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statIconBox, { backgroundColor: accentBg }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
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
    fontSize: typography.sizes.bodySmall,
    color: P.textSec,
    fontWeight: typography.weights.medium,
    marginBottom: 3,
  },
  userName: {
    fontSize: 30,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: P.surface,
    borderWidth: 1,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarBtn: {
    backgroundColor: P.navyMuted,
    borderColor: P.navyBorder,
  },

  /* ── Hero Card ── */
  heroCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 20,
    marginBottom: 28,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroScore: {
    fontSize: 46,
    fontWeight: typography.weights.bold,
    color: P.navy,
    letterSpacing: -1,
    lineHeight: 50,
  },
  optimalBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: P.navyMuted,
    borderWidth: 1,
    borderColor: P.navyBorder,
  },
  optimalText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: P.navy,
    letterSpacing: 0.3,
  },
  heroDesc: {
    fontSize: 14,
    color: P.textSec,
    lineHeight: 21,
    marginBottom: 14,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: P.surfaceAlt,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: P.gold,
  },
  subMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: P.navyBorder,
  },
  subMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  subMetricDivider: {
    width: 1,
    height: 22,
    backgroundColor: P.navyBorder,
  },
  subMetricLabel: {
    fontSize: 12,
    color: P.textSec,
    marginBottom: 3,
  },
  subMetricValue: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: P.text,
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
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: typography.weights.semibold,
    color: P.navy,
    marginBottom: 14,
  },

  /* ── Stats Grid ── */
  statsGrid: {
    gap: 12,
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 16,
    minHeight: 110,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: typography.weights.medium,
    color: P.textSec,
  },

  /* ── Recommended Training ── */
  recommendedCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 20,
    marginBottom: 28,
  },
  recTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recIconBox: {
    width: 42,
    height: 42,
    borderRadius: radii.sm,
    backgroundColor: P.navyMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: P.text,
  },
  recMeta: {
    fontSize: 12,
    color: P.textSec,
    marginTop: 2,
  },
  recTimeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: P.surfaceAlt,
    borderWidth: 1,
    borderColor: P.border,
  },
  recTimeText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: P.textSec,
  },
  recDesc: {
    fontSize: 13,
    color: P.textSec,
    lineHeight: 20,
    marginBottom: 16,
  },
  startBtn: {
    borderRadius: radii.button,
    overflow: 'hidden',
  },
  startBtnInner: {
    height: 50,
    borderRadius: radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
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
