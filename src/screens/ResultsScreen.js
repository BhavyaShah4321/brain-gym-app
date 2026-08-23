/**
 * OVERLOAD ResultsScreen
 * Premium Luxury Light Theme — Post-session cognitive performance summary
 * Supports Working Memory, Focus & Attention, Reaction Speed, and multi-faculty telemetry.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '../theme/typography';
import spacing, { radii, shadows } from '../theme/spacing';
import { ROUTES } from '../constants/routes';
import { triggerHaptic } from '../utils/haptics';
import { usePlayer } from '../context';
import storageService from '../services/storageService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
};

const SCREEN_PAD = 24;

export default function ResultsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { refreshProfile } = usePlayer();
  const hasPersistedRef = useRef(false);

  const summary = route.params?.summary || {
    gameType: 'memory',
    facultyId: 'memory',
    mode: 'sequence_recall',
    totalRounds: 3,
    averageAccuracy: 100,
    averageResponseTimeMs: 380,
    currentSpan: 4,
  };
  const elapsedSeconds = route.params?.elapsedSeconds || 90;

  const isReaction = summary.facultyId === 'reaction' || summary.gameType === 'reaction';
  const isFocus = summary.facultyId === 'focus' || summary.gameType === 'focus';
  const isProcessing = summary.facultyId === 'processing' || summary.gameType === 'processing';
  const isDecision = summary.facultyId === 'decision' || summary.gameType === 'decision';
  const isSpatial = summary.facultyId === 'spatial' || summary.gameType === 'spatial';
  const isFlexibility = summary.facultyId === 'flexibility' || summary.gameType === 'flexibility';
  const isLogic = summary.facultyId === 'logic' || summary.gameType === 'logic';
  const isMindRush = summary.facultyId === 'mind-rush' || summary.gameType === 'mind-rush';

  const facultyTitle = isMindRush
    ? 'MIND RUSH ARCADE'
    : isLogic
    ? 'LOGIC & REASONING'
    : isFlexibility
    ? 'COGNITIVE FLEXIBILITY'
    : isSpatial
    ? 'SPATIAL REASONING'
    : isDecision
    ? 'DECISION MAKING'
    : isProcessing
    ? 'PROCESSING SPEED'
    : isReaction
    ? 'REACTION SPEED'
    : isFocus
    ? 'FOCUS & ATTENTION'
    : 'WORKING MEMORY';

  const modeTitle = isMindRush
    ? summary.mode === 'chain_reaction'
      ? 'Chain Reaction'
      : summary.mode === 'boss_breaker'
      ? 'Boss Breaker'
      : 'Blast Logic'
    : isLogic
    ? summary.mode === 'sequence_logic'
      ? 'Sequence Logic'
      : summary.mode === 'constraint_solver'
      ? 'Constraint Solver'
      : 'Deduction Grid'
    : isFlexibility
    ? summary.mode === 'pattern_shift'
      ? 'Pattern Shift'
      : summary.mode === 'dual_rule'
      ? 'Dual Rule'
      : 'Sort Shift'
    : isSpatial
    ? summary.mode === 'spatial_navigation'
      ? 'Spatial Navigation'
      : summary.mode === 'mirror_map'
      ? 'Mirror Map'
      : 'Mental Rotation'
    : isDecision
    ? summary.mode === 'best_choice'
      ? 'Best Choice'
      : summary.mode === 'rule_switch'
      ? 'Rule Switch'
      : 'Priority Sort'
    : isProcessing
    ? summary.mode === 'number_scan'
      ? 'Number Scan'
      : summary.mode === 'pattern_complete'
      ? 'Pattern Complete'
      : 'Symbol Match'
    : isReaction
    ? summary.mode === 'direction_reaction'
      ? 'Direction Reaction'
      : summary.mode === 'rapid_choice'
      ? 'Rapid Choice'
      : 'Target Tap'
    : isFocus
    ? summary.mode === 'visual_tracking'
      ? 'Visual Tracking'
      : 'Target Search'
    : summary.mode === 'grid_memory'
    ? 'Grid Memory'
    : summary.mode === 'object_recall'
    ? 'Object Recall'
    : summary.mode === 'order_recall'
    ? 'Order Recall'
    : 'Sequence Recall';

  // Calculate drill score
  let calculatedScore = 0;
  if (typeof summary.score === 'number' && summary.score > 0) {
    calculatedScore = summary.score;
  } else {
    const baseScore = (summary.averageAccuracy || 0) * 8;
    const speedBonus = Math.max(0, 500 - (summary.averageResponseTimeMs || 400));
    const spanMultiplier = (summary.currentSpan || summary.peakLevel || 3) * 20;
    calculatedScore = Math.round(baseScore + speedBonus + spanMultiplier);
  }

  const accuracy = summary.averageAccuracy || 0;
  const isPersonalBest = calculatedScore >= 800;
  const accuracyStatus = accuracy >= 90 ? 'Excellent' : accuracy >= 75 ? 'Good' : accuracy >= 50 ? 'Fair' : 'Developing';

  // Persist session to local AsyncStorage
  useEffect(() => {
    if (hasPersistedRef.current) return;
    hasPersistedRef.current = true;

    const sessionPayload = {
      gameType: isMindRush ? 'mind-rush' : isLogic ? 'logic' : isFlexibility ? 'flexibility' : isSpatial ? 'spatial' : isDecision ? 'decision' : isProcessing ? 'processing' : isReaction ? 'reaction' : isFocus ? 'focus' : 'memory-span',
      category: isMindRush ? 'mind_rush' : isLogic ? 'logic' : isFlexibility ? 'flexibility' : isSpatial ? 'spatial' : isDecision ? 'decision' : isProcessing ? 'processing' : isReaction ? 'reaction' : isFocus ? 'focus' : 'working-memory',
      facultyId: isMindRush ? 'mind-rush' : isLogic ? 'logic' : isFlexibility ? 'flexibility' : isSpatial ? 'spatial' : isDecision ? 'decision' : isProcessing ? 'processing' : isReaction ? 'reaction' : isFocus ? 'focus' : 'memory',
      modeId: summary.mode || (isMindRush ? 'blast_logic' : isLogic ? 'deduction_grid' : isFlexibility ? 'sort_shift' : isSpatial ? 'mental_rotation' : isDecision ? 'priority_sort' : isProcessing ? 'symbol_match' : isReaction ? 'target_tap' : isFocus ? 'target_search' : 'sequence_recall'),
      score: calculatedScore,
      accuracy: accuracy,
      latency: summary.averageResponseTimeMs || 0,
      responseTime: summary.averageResponseTimeMs || 0,
      span: summary.currentSpan || summary.peakLevel || 3,
      streak: summary.bestCombo || (summary.currentSpan >= 3 ? summary.currentSpan - 2 : 1),
      totalRounds: summary.totalRounds || 1,
      durationSeconds: elapsedSeconds,
      difficulty: 'adaptive',
      result: accuracy >= 80 ? 'success' : 'completed',
      isPerfect: accuracy === 100 && (summary.falseStartCount || 0) === 0,
    };

    storageService.saveGameSession(sessionPayload)
      .then(() => {
        if (refreshProfile) refreshProfile();
      })
      .catch((err) => {
        console.warn('Local session save failed:', err);
      });
  }, [calculatedScore, summary, elapsedSeconds, isMindRush, isLogic, isFlexibility, isSpatial, isDecision, isProcessing, isReaction, isFocus, refreshProfile]);

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 12
      : Math.max(insets.top, 20) + 8;

  const bottomPad = Math.max(insets.bottom, 20) + 20;

  const handleTrainAgain = () => {
    triggerHaptic('medium');
    if (isMindRush) {
      navigation.replace(ROUTES.MIND_RUSH_GAME, {
        categoryId: 'mind_rush',
        mode: summary.mode || 'blast_logic',
      });
    } else if (isLogic) {
      navigation.replace(ROUTES.LOGIC_GAME, {
        categoryId: 'logic',
        mode: summary.mode || 'deduction_grid',
      });
    } else if (isFlexibility) {
      navigation.replace(ROUTES.FLEXIBILITY_GAME, {
        categoryId: 'flexibility',
        mode: summary.mode || 'sort_shift',
      });
    } else if (isSpatial) {
      navigation.replace(ROUTES.SPATIAL_GAME, {
        categoryId: 'spatial',
        mode: summary.mode || 'mental_rotation',
      });
    } else if (isDecision) {
      navigation.replace(ROUTES.DECISION_GAME, {
        categoryId: 'decision',
        mode: summary.mode || 'priority_sort',
      });
    } else if (isProcessing) {
      navigation.replace(ROUTES.PROCESSING_GAME, {
        categoryId: 'processing',
        mode: summary.mode || 'symbol_match',
      });
    } else if (isReaction) {
      navigation.replace(ROUTES.REACTION_GAME, {
        categoryId: 'reaction',
        mode: summary.mode || 'target_tap',
      });
    } else if (isFocus) {
      navigation.replace(ROUTES.FOCUS_GAME, {
        categoryId: 'focus',
        mode: summary.mode || 'target_search',
      });
    } else {
      navigation.replace(ROUTES.GAME, {
        categoryId: 'memory',
        mode: summary.mode || 'sequence_recall',
      });
    }
  };

  const handleGoToTraining = () => {
    triggerHaptic('light');
    navigation.navigate(ROUTES.MAIN_TABS, { screen: 'TrainingTab' });
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
            <Text style={styles.greeting}>{facultyTitle}</Text>
            <Text style={styles.userName}>Session Complete</Text>
          </View>
        </View>

        {/* ── SCORE HERO CARD ── */}
        <LinearGradient
          colors={['#F5F2ED', '#EDE9E1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>PERFORMANCE INDEX</Text>
              <Text style={styles.heroScore}>{calculatedScore}</Text>
            </View>
            <View style={styles.heroRightCol}>
              <View style={styles.heroBadgeRow}>
                <View style={[styles.heroBadge, { backgroundColor: P.navyMuted, borderColor: P.navyBorder }]}>
                  <Text style={[styles.heroBadgeText, { color: P.navy }]} numberOfLines={1}>
                    {modeTitle}
                  </Text>
                </View>
              </View>
              {isPersonalBest ? (
                <View style={[styles.heroBadge, { backgroundColor: P.goldMuted, borderColor: P.goldBorder, marginTop: 6 }]}>
                  <Ionicons name="trophy-outline" size={12} color={P.gold} style={{ marginRight: 4 }} />
                  <Text style={[styles.heroBadgeText, { color: P.gold }]}>New Best</Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text style={styles.heroDesc}>
            {isReaction
              ? 'Composite score calibrated across neural reaction velocity and decision latency.'
              : isFocus
              ? 'Composite score calibrated across target precision, distractor filtering, and latency.'
              : 'Composite score based on retention capacity and neural processing speed.'}
          </Text>

          {/* Accuracy Progress Bar */}
          <View style={styles.accuracySection}>
            <View style={styles.accuracyHeader}>
              <Text style={styles.accuracyLabel}>Accuracy</Text>
              <View style={styles.accuracyValueRow}>
                <Text style={styles.accuracyValue}>{accuracy}%</Text>
                <View style={[styles.accuracyStatusBadge, {
                  backgroundColor: accuracy >= 90 ? P.sageMuted : accuracy >= 75 ? P.goldMuted : P.roseMuted,
                }]}>
                  <Text style={[styles.accuracyStatusText, {
                    color: accuracy >= 90 ? P.sage : accuracy >= 75 ? P.gold : P.rose,
                  }]}>{accuracyStatus}</Text>
                </View>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, accuracy)}%`,
                    backgroundColor: accuracy >= 90 ? P.sage : accuracy >= 75 ? P.gold : P.rose,
                  },
                ]}
              />
            </View>
          </View>

          {/* Sub-metrics row */}
          <View style={styles.subMetrics}>
            <View style={styles.subMetricItem}>
              <Text style={styles.subMetricLabel}>Rounds</Text>
              <Text style={styles.subMetricValue}>{summary.totalRounds || 0}</Text>
            </View>
            <View style={styles.subMetricDivider} />
            <View style={styles.subMetricItem}>
              <Text style={styles.subMetricLabel}>Avg Latency</Text>
              <Text style={styles.subMetricValue}>{summary.averageResponseTimeMs || 0}ms</Text>
            </View>
            <View style={styles.subMetricDivider} />
            <View style={styles.subMetricItem}>
              <Text style={styles.subMetricLabel}>Duration</Text>
              <Text style={styles.subMetricValue}>{elapsedSeconds}s</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── DETAILED TELEMETRY ── */}
        <Text style={styles.sectionTitle}>Detailed Telemetry</Text>
        <View style={styles.statsGrid}>
          {isReaction ? (
            <>
              <View style={styles.statsRow}>
                <StatBox
                  value={`${summary.averageResponseTimeMs || 0}ms`}
                  label="Mean Latency"
                  icon="flash-outline"
                  accent={P.gold}
                  accentBg={P.goldMuted}
                />
                <StatBox
                  value={summary.bestReactionTimeMs ? `${summary.bestReactionTimeMs}ms` : '—'}
                  label="Best Reflex"
                  icon="speedometer-outline"
                  accent={P.navy}
                  accentBg={P.navyMuted}
                />
              </View>
              <View style={styles.statsRow}>
                <StatBox
                  value={`${accuracy}%`}
                  label="Accuracy"
                  icon="checkmark-circle-outline"
                  accent={P.sage}
                  accentBg={P.sageMuted}
                />
                <StatBox
                  value={`${summary.totalRounds || 0}`}
                  label="Rounds Done"
                  icon="repeat-outline"
                  accent={P.rose}
                  accentBg={P.roseMuted}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.statsRow}>
                <StatBox
                  value={`${accuracy}%`}
                  label="Accuracy"
                  icon="checkmark-circle-outline"
                  accent={P.sage}
                  accentBg={P.sageMuted}
                />
                <StatBox
                  value={`${summary.averageResponseTimeMs || 0}ms`}
                  label="Mean Latency"
                  icon="flash-outline"
                  accent={P.gold}
                  accentBg={P.goldMuted}
                />
              </View>
              <View style={styles.statsRow}>
                <StatBox
                  value={isFocus ? `${summary.bestCombo || 0}x` : `${summary.currentSpan || 3}`}
                  label={isFocus ? 'Best Combo' : 'Peak Span'}
                  icon={isFocus ? 'flame-outline' : 'cube-outline'}
                  accent={P.navy}
                  accentBg={P.navyMuted}
                />
                <StatBox
                  value={`${summary.totalRounds || 0}`}
                  label="Rounds Done"
                  icon="repeat-outline"
                  accent={P.rose}
                  accentBg={P.roseMuted}
                />
              </View>
            </>
          )}
        </View>

        {/* ── PERFORMANCE INSIGHT ── */}
        <Text style={styles.sectionTitle}>Performance Insight</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightIconBox}>
            <Ionicons name="bulb-outline" size={18} color={P.navy} />
          </View>
          <Text style={styles.insightText}>
            {isReaction
              ? (summary.averageResponseTimeMs || 400) <= 280
                ? 'Exceptional visual-motor response latency with swift neural processing. High reaction consistency observed under variable timing.'
                : 'Neural motor trigger latency was consistent. Focus on relaxing before stimulus onset to avoid early anticipatory tension.'
              : isFocus
              ? summary.mode === 'visual_tracking'
                ? (accuracy >= 90
                  ? 'High dynamic spatial tracking fidelity maintained across complex multi-object trajectories.'
                  : 'Continuous visual tracking was consistent with slight loss during rapid path crossings. Continue tracking drills to sharpen spatial focus.')
                : (accuracy >= 90
                ? 'High selective attention maintained under competing visual noise. Target discrimination velocity remained swift.'
                : 'Attention throughput was steady, with minor distractor capture during higher density tiers. Continue training to suppress interference.')
              : accuracy >= 90
              ? 'Cognitive encoding maintained high fidelity under progressive demands. Your performance capacity is trending upward.'
              : 'Response latency was stable, with minor decay during higher complexity tiers. Keep training to improve consistency.'}
          </Text>
        </View>

        {/* ── ACTIONS ── */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleTrainAgain}
            style={styles.startBtn}
            accessibilityLabel="Play Again"
          >
            <LinearGradient
              colors={[P.navy, P.navyLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startBtnInner}
            >
              <Ionicons name="refresh" size={18} color={P.textInverse} />
              <Text style={styles.startBtnText}>Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGoToTraining}
            style={styles.secondaryBtn}
            accessibilityLabel="Back to Training"
          >
            <Ionicons name="grid-outline" size={17} color={P.navy} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>Back to Training</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacer */}
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
      <Text
        style={styles.statValue}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
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
  heroRightCol: {
    alignItems: 'flex-end',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  heroDesc: {
    fontSize: 14,
    color: P.textSec,
    lineHeight: 21,
    marginBottom: 16,
  },

  /* ── Accuracy Section inside hero ── */
  accuracySection: {
    marginBottom: 16,
  },
  accuracyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accuracyLabel: {
    fontSize: 13,
    fontWeight: typography.weights.medium,
    color: P.textSec,
  },
  accuracyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accuracyValue: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
  },
  accuracyStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  accuracyStatusText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: P.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  /* ── Sub-metrics ── */
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
    fontSize: 11,
    color: P.textMuted,
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
    ...shadows.subtle,
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
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: typography.weights.medium,
    color: P.textSec,
  },

  /* ── Insight Card ── */
  insightCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 18,
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    ...shadows.subtle,
  },
  insightIconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: P.navyMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: P.textSec,
    lineHeight: 21,
  },

  /* ── Buttons ── */
  buttonGroup: {
    gap: 10,
    marginBottom: 12,
  },
  startBtn: {
    borderRadius: radii.button,
    overflow: 'hidden',
  },
  startBtnInner: {
    height: 56,
    borderRadius: radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: P.textInverse,
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    height: 56,
    borderRadius: radii.button,
    backgroundColor: P.surface,
    borderWidth: 1,
    borderColor: P.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.subtle,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: typography.weights.semibold,
    color: P.navy,
  },
});
