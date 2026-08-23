/**
 * OVERLOAD CategoryDetailScreen
 * Premium Luxury Light Theme — matching Home/Training/Progress aesthetic
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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import { TRAINING_CATEGORIES } from '../constants/categories';
import { ROUTES } from '../constants/routes';
import { triggerHaptic } from '../utils/haptics';
import storageService from '../services/storageService';

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
  textInverse: '#FFFFFF',

  danger: '#C4787A',
  dangerDark: '#A86062',
};

const SCREEN_PAD = 24;

export default function CategoryDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const categoryId = route.params?.categoryId || 'memory';
  const category =
    TRAINING_CATEGORIES.find((c) => c.id === categoryId) ||
    TRAINING_CATEGORIES[0];

  const [facultyData, setFacultyData] = React.useState(null);

  React.useEffect(() => {
    storageService.getAllFaculties().then((faculties) => {
      if (faculties && faculties[categoryId]) {
        setFacultyData(faculties[categoryId]);
      }
    });
  }, [categoryId]);

  const liveLevel = facultyData?.level || category.level || 1;
  const liveMetric = category.id === 'reaction'
    ? (facultyData?.metrics?.averageLatency ? `${facultyData.metrics.averageLatency} ms` : category.defaultMetric)
    : category.id === 'processing'
    ? (facultyData?.metrics?.accuracy ? `${facultyData.metrics.accuracy}%` : category.defaultMetric)
    : (facultyData?.metrics?.peakSpan
        ? `${facultyData.metrics.peakSpan} items`
        : (facultyData?.metrics?.accuracy ? `${facultyData.metrics.accuracy}%` : category.defaultMetric));
  const liveScore = facultyData?.metrics?.bestScore ? `${facultyData.metrics.bestScore}` : (category.bestScore ? `${category.bestScore}` : '—');
  const liveAccuracy = facultyData?.metrics?.accuracy ? `${facultyData.metrics.accuracy}%` : (category.accuracy || '—');

  const accent = category.accentColor || P.navy;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 12
      : Math.max(insets.top, 20) + 8;

  const bottomPad = Math.max(insets.bottom, 20) + 20;

  const handleStartMode = (mode) => {
    triggerHaptic('medium');
    if (category.id === 'focus') {
      navigation.navigate(ROUTES.FOCUS_GAME, {
        categoryId: category.id,
        mode: mode.id,
      });
    } else if (category.id === 'reaction') {
      navigation.navigate(ROUTES.REACTION_GAME, {
        categoryId: category.id,
        mode: mode.id,
      });
    } else if (category.id === 'processing') {
      navigation.navigate(ROUTES.PROCESSING_GAME, {
        categoryId: category.id,
        mode: mode.id,
      });
    } else if (category.id === 'decision') {
      navigation.navigate(ROUTES.DECISION_GAME, {
        categoryId: category.id,
        mode: mode.id,
      });
    } else if (category.id === 'spatial') {
      navigation.navigate(ROUTES.SPATIAL_GAME, {
        categoryId: category.id,
        mode: mode.id,
      });
    } else if (category.id === 'flexibility') {
      navigation.navigate(ROUTES.FLEXIBILITY_GAME, {
        categoryId: category.id,
        mode: mode.id,
      });
    } else if (category.id === 'logic') {
      navigation.navigate(ROUTES.LOGIC_GAME, {
        categoryId: category.id,
        mode: mode.id,
      });
    } else if (category.id === 'mind_rush') {
      navigation.navigate(ROUTES.MIND_RUSH_GAME, {
        categoryId: category.id,
        mode: mode.id,
      });
    } else {
      navigation.navigate(ROUTES.GAME, {
        categoryId: category.id,
        mode: mode.id,
      });
    }
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
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={P.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerSubtitle}>COGNITIVE SYSTEM</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {category.name}
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* ── HERO FACULTY CARD ── */}
        <LinearGradient
          colors={['#F5F2ED', '#EDE9E1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={[styles.heroIconBox, { backgroundColor: `${accent}12` }]}>
              <Ionicons
                name={category.icon || 'cube-outline'}
                size={26}
                color={accent}
              />
            </View>
            <View style={[styles.levelBadge, { borderColor: `${accent}30` }]}>
              <Text style={[styles.levelText, { color: accent }]}>
                Level {liveLevel}
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{category.name}</Text>
          <Text style={styles.heroDesc}>{category.tagline}</Text>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Faculty Calibration</Text>
              <Text style={styles.progressValue}>
                Tier {liveLevel} of 5
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(liveLevel / 5) * 100}%`,
                    backgroundColor: accent,
                  },
                ]}
              />
            </View>
          </View>
        </LinearGradient>

        {/* ── PERFORMANCE TELEMETRY ── */}
        <Text style={styles.sectionTitle}>Performance Telemetry</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatBox
              value={liveMetric}
              label={category.metricName}
              icon="speedometer-outline"
              accent={accent}
              accentBg={`${accent}12`}
            />
            <StatBox
              value={liveScore}
              label="Best Score"
              icon="trophy-outline"
              accent={P.gold}
              accentBg={P.goldMuted}
            />
          </View>
          <View style={styles.statsRow}>
            <StatBox
              value={liveAccuracy}
              label="Mean Accuracy"
              icon="checkmark-circle-outline"
              accent={P.sage}
              accentBg={P.sageMuted}
            />
            <StatBox
              value="—"
              label="Weekly Trend"
              icon="trending-up-outline"
              accent={P.rose}
              accentBg={P.roseMuted}
            />
          </View>
        </View>

        {/* ── TRAINING MODES ── */}
        <Text style={styles.sectionTitle}>Training Modes</Text>
        <Text style={styles.sectionSubtitle}>
          {category.modes?.length || 0} protocol variations
        </Text>

        <View style={styles.modesList}>
          {category.modes && category.modes.length > 0
            ? category.modes.map((mode) => {
                const isPlayable = mode.isAvailable;

                return (
                  <View key={mode.id} style={styles.modeCard}>
                    <View style={styles.modeHeader}>
                      <View style={styles.modeHeaderLeft}>
                        <Text style={styles.modeTitle}>{mode.name}</Text>
                        <View style={styles.modeMetaRow}>
                          <View
                            style={[
                              styles.difficultyBadge,
                              { borderColor: `${accent}30` },
                            ]}
                          >
                            <Text
                              style={[styles.difficultyText, { color: accent }]}
                            >
                              {isPlayable ? 'Tier 2' : 'Tier 1'}
                            </Text>
                          </View>
                          <Text style={styles.modeDuration}>
                            {mode.estimatedDuration || '~90 sec'}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isPlayable
                            ? { backgroundColor: P.navyMuted, borderColor: P.navyBorder }
                            : { backgroundColor: P.surfaceAlt, borderColor: P.border },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            isPlayable
                              ? { color: P.navy }
                              : { color: P.textMuted },
                          ]}
                        >
                          {isPlayable ? 'Active' : 'Locked'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.modeDesc}>{mode.description}</Text>

                    {isPlayable ? (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleStartMode(mode)}
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
                          <Ionicons name="play" size={16} color={P.textInverse} />
                        </LinearGradient>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.lockedRow}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={14}
                          color={P.textMuted}
                        />
                        <Text style={styles.lockedText}>
                          Unlocks after completing Tier Calibration
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            : null}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: P.surface,
    borderWidth: 1,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
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
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconBox: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  levelText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 14,
    color: P.textSec,
    lineHeight: 21,
  },
  progressSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: P.navyBorder,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: P.textSec,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: P.text,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: P.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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

  /* ── Training Modes ── */
  modesList: {
    gap: 10,
  },
  modeCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 18,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  modeHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: P.text,
    marginBottom: 6,
  },
  modeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  modeDuration: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: P.textSec,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  modeDesc: {
    fontSize: 13,
    color: P.textSec,
    lineHeight: 20,
    marginBottom: 14,
  },
  startBtn: {
    borderRadius: radii.button,
    overflow: 'hidden',
  },
  startBtnInner: {
    height: 44,
    borderRadius: radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: P.textInverse,
    letterSpacing: 0.2,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: P.border,
  },
  lockedText: {
    fontSize: 12,
    color: P.textMuted,
  },
});
