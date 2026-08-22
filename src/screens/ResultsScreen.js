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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import { ROUTES } from '../constants/routes';
import { triggerHaptic } from '../utils/haptics';
import { useAuth } from '../hooks/useAuth';
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
};

const SCREEN_PAD = 24;

export default function ResultsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { refreshProfile } = useAuth();
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

  const facultyTitle = isReaction
    ? 'REACTION SPEED'
    : isFocus
    ? 'FOCUS & ATTENTION'
    : 'WORKING MEMORY';

  const modeTitle = isReaction
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

  const isPersonalBest = calculatedScore >= 800;

  // Persist session to local AsyncStorage
  useEffect(() => {
    if (hasPersistedRef.current) return;
    hasPersistedRef.current = true;

    const sessionPayload = {
      gameType: isReaction ? 'reaction' : isFocus ? 'focus' : 'memory-span',
      category: isReaction ? 'reaction' : isFocus ? 'focus' : 'working-memory',
      facultyId: isReaction ? 'reaction' : isFocus ? 'focus' : 'memory',
      modeId: summary.mode || (isReaction ? 'target_tap' : isFocus ? 'target_search' : 'sequence_recall'),
      score: calculatedScore,
      accuracy: summary.averageAccuracy || 0,
      latency: summary.averageResponseTimeMs || 0,
      responseTime: summary.averageResponseTimeMs || 0,
      span: summary.currentSpan || summary.peakLevel || 3,
      streak: summary.bestCombo || (summary.currentSpan >= 3 ? summary.currentSpan - 2 : 1),
      totalRounds: summary.totalRounds || 1,
      durationSeconds: elapsedSeconds,
      difficulty: 'adaptive',
      result: (summary.averageAccuracy || 0) >= 80 ? 'success' : 'completed',
      isPerfect: (summary.averageAccuracy || 0) === 100 && (summary.falseStartCount || 0) === 0,
    };

    storageService.saveGameSession(sessionPayload)
      .then(() => {
        if (refreshProfile) refreshProfile();
      })
      .catch((err) => {
        console.warn('Local session save failed:', err);
      });
  }, [calculatedScore, summary, elapsedSeconds, isReaction, isFocus, refreshProfile]);

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 12
      : Math.max(insets.top, 20) + 8;

  const bottomPad = Math.max(insets.bottom, 20) + 20;

  const handleTrainAgain = () => {
    triggerHaptic('medium');
    if (isReaction) {
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
          style={styles.scoreCard}
        >
          <View style={styles.scoreTopRow}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: P.navyMuted, borderColor: P.navyBorder }]}>
                <Text style={[styles.badgeText, { color: P.navy }]}>{modeTitle}</Text>
              </View>
              {isPersonalBest ? (
                <View style={[styles.badge, { backgroundColor: P.goldMuted, borderColor: P.goldBorder }]}>
                  <Text style={[styles.badgeText, { color: P.gold }]}>New Best</Text>
                </View>
              ) : (
                <View style={[styles.badge, { backgroundColor: P.surfaceAlt, borderColor: P.border }]}>
                  <Text style={[styles.badgeText, { color: P.textSec }]}>Calibrated</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.scoreCenter}>
            <Text style={styles.scoreLabel}>PERFORMANCE INDEX</Text>
            <Text style={styles.scoreValue}>{calculatedScore}</Text>
            <Text style={styles.scoreDesc}>
              {isReaction
                ? 'Composite score calibrated across raw neural reaction velocity and decision latency'
                : isFocus
                ? 'Composite score calibrated across target precision, distractor filtering, and latency'
                : 'Composite score based on retention capacity and neural latency'}
            </Text>
          </View>
        </LinearGradient>

        {/* ── TELEMETRY GRID ── */}
        <Text style={styles.sectionTitle}>Session Telemetry</Text>
        <View style={styles.statsGrid}>
          {isReaction ? (
            <>
              <View style={styles.statsRow}>
                <StatBox
                  value={`${summary.averageResponseTimeMs || 0} ms`}
                  label="Mean Latency"
                  icon="flash-outline"
                  accent={P.gold}
                  accentBg={P.goldMuted}
                />
                <StatBox
                  value={summary.bestReactionTimeMs ? `${summary.bestReactionTimeMs} ms` : '—'}
                  label="Best Reflex"
                  icon="speedometer-outline"
                  accent={P.navy}
                  accentBg={P.navyMuted}
                />
              </View>
              <View style={styles.statsRow}>
                <StatBox
                  value={`${summary.averageAccuracy || 0}%`}
                  label="Accuracy"
                  icon="checkmark-circle-outline"
                  accent={P.sage}
                  accentBg={P.sageMuted}
                />
                <StatBox
                  value={`${summary.totalRounds || 0}`}
                  label="Rounds Completed"
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
                  value={`${summary.averageAccuracy || 0}%`}
                  label="Mean Accuracy"
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
                  value={isFocus ? `${summary.bestCombo || 0}x` : `${summary.currentSpan || 3} items`}
                  label={isFocus ? 'Best Combo' : 'Peak Span'}
                  icon={isFocus ? 'flame-outline' : 'cube-outline'}
                  accent={P.navy}
                  accentBg={P.navyMuted}
                />
                <StatBox
                  value={`${summary.totalRounds || 0}`}
                  label="Rounds Completed"
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
                ? (summary.averageAccuracy || 0) >= 90
                  ? 'High dynamic spatial tracking fidelity maintained across complex multi-object trajectories.'
                  : 'Continuous visual tracking was consistent with slight loss during rapid path crossings. Continue tracking drills to sharpen spatial focus.'
                : (summary.averageAccuracy || 0) >= 90
                ? 'High selective attention maintained under competing visual noise. Target discrimination velocity remained swift.'
                : 'Attention throughput was steady, with minor distractor capture during higher density tiers. Continue training to suppress interference.'
              : (summary.averageAccuracy || 0) >= 90
              ? 'Working-memory encoding maintained high fidelity under progressive sequence demands. Your retention span is trending upward.'
              : 'Response latency was stable, with minor decay during higher span complexity tiers. Keep training to improve consistency.'}
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

  /* ── Score Card ── */
  scoreCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 20,
    marginBottom: 28,
    overflow: 'hidden',
  },
  scoreTopRow: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  scoreCenter: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 52,
    fontWeight: typography.weights.bold,
    color: P.navy,
    letterSpacing: -1,
    lineHeight: 56,
    marginBottom: 6,
  },
  scoreDesc: {
    fontSize: 13,
    color: P.textSec,
    textAlign: 'center',
    lineHeight: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: typography.weights.semibold,
    color: P.text,
  },
});
