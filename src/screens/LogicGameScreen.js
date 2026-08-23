/**
 * OVERLOAD LogicGameScreen
 * Premium Luxury Light Theme — Logic & Reasoning
 * Supports 3 distinct logical deduction games:
 * 1. Deduction Grid (Persistent clues, entity elimination, deductive reasoning)
 * 2. Sequence Logic (Mathematical and symbolic sequence rule induction)
 * 3. Constraint Solver (Multi-condition satisfiability & exclusion)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Alert,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import {
  LogicEngine,
  LOGIC_MODES,
  LOGIC_MODE_DETAILS,
  SESSION_TYPES,
  getLogicComboMultiplier,
} from '../games/logic';
import { ROUTES } from '../constants/routes';
import { triggerHaptic } from '../utils/haptics';

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

  indigo: '#4F46E5',
  indigoMuted: 'rgba(79, 70, 229, 0.12)',
  indigoBorder: 'rgba(79, 70, 229, 0.40)',

  gold: '#C5A55A',
  goldLight: '#D4B96E',
  goldMuted: 'rgba(197, 165, 90, 0.12)',
  goldBorder: 'rgba(197, 165, 90, 0.40)',

  sage: '#6B8F71',
  sageMuted: 'rgba(107, 143, 113, 0.12)',
  sageBorder: 'rgba(107, 143, 113, 0.40)',

  rose: '#C4787A',
  roseMuted: 'rgba(196, 120, 122, 0.12)',
  roseBorder: 'rgba(196, 120, 122, 0.40)',

  text: '#1A1A2E',
  textSec: '#6B6B7B',
  textMuted: '#9E9EAE',
  textInverse: '#FFFFFF',

  danger: '#C4787A',
};

export default function LogicGameScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const mode = route.params?.mode || LOGIC_MODES.DEDUCTION_GRID;
  const sessionType = route.params?.sessionType || SESSION_TYPES.QUICK;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 8
      : Math.max(insets.top, 20) + 4;

  const [engine] = useState(() => new LogicEngine({ mode, sessionType }));
  const [currentTask, setCurrentTask] = useState(null);

  // States: 'active' | 'feedback'
  const [roundPhase, setRoundPhase] = useState('active');
  const [feedbackData, setFeedbackData] = useState(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [roundNumber, setRoundNumber] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isEvaluatingRef = useRef(false);
  const roundStartTimeRef = useRef(Date.now());
  const timeoutTimerRef = useRef(null);

  // Countdown timer bar
  const countdownAnim = useRef(new Animated.Value(1)).current;

  // Session clock
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, []);

  // Load next round
  const loadNextRound = useCallback(() => {
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

    const task = engine.startNextTask();
    setCurrentTask(task);
    setRoundNumber(engine.roundNumber);
    setLevel(engine.currentLevel);
    setRoundPhase('active');
    setFeedbackData(null);
    setSelectedChoiceId(null);
    isEvaluatingRef.current = false;
    roundStartTimeRef.current = Date.now();

    // Start countdown
    countdownAnim.setValue(1);
    Animated.timing(countdownAnim, {
      toValue: 0,
      duration: task.timeoutWindowMs,
      useNativeDriver: false,
    }).start();

    // Start timeout timer
    timeoutTimerRef.current = setTimeout(() => {
      if (!isEvaluatingRef.current && !isPaused) {
        handleTimeout(task);
      }
    }, task.timeoutWindowMs);
  }, [engine, isPaused, countdownAnim]);

  useEffect(() => {
    loadNextRound();
  }, []);

  // Handle Timeout
  const handleTimeout = (task) => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;

    triggerHaptic('error');
    const result = engine.handleTimeout();

    setScore(result.totalScore);
    setCombo(result.currentCombo);
    setRoundPhase('feedback');
    setFeedbackData({
      isCorrect: false,
      isTimedOut: true,
      text: 'TIME EXPIRED',
      subtext: 'Reasoning window exceeded',
    });

    if (result.isSessionFinished) {
      setTimeout(() => navigateToResults(), 800);
    } else {
      setTimeout(() => loadNextRound(), 750);
    }
  };

  // Submit User Logic Choice
  const handleSelectChoice = (choiceId) => {
    if (isEvaluatingRef.current || isPaused || !currentTask || roundPhase !== 'active') return;

    isEvaluatingRef.current = true;
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    countdownAnim.stopAnimation();

    const responseTimeMs = Date.now() - roundStartTimeRef.current;
    const result = engine.submitResponse(choiceId, responseTimeMs);

    setScore(result.totalScore);
    setCombo(result.currentCombo);
    setLevel(engine.currentLevel);
    setSelectedChoiceId(choiceId);
    setRoundPhase('feedback');

    if (result.evaluation.isCorrect) {
      triggerHaptic('success');
      setFeedbackData({
        isCorrect: true,
        text: result.evaluation.feedbackMessage || 'VALID DEDUCTION',
        subtext: `${Math.round(responseTimeMs)} ms · High Precision`,
      });
    } else {
      triggerHaptic('error');
      setFeedbackData({
        isCorrect: false,
        text: result.evaluation.feedbackMessage || 'LOGICAL ERROR',
        subtext: 'Review constraints and eliminate contradictions',
      });
    }

    if (result.isSessionFinished) {
      setTimeout(() => navigateToResults(), 900);
    } else {
      setTimeout(() => loadNextRound(), result.evaluation.isCorrect ? 750 : 1050);
    }
  };

  const navigateToResults = () => {
    const summary = engine.getSessionSummary();
    navigation.replace(ROUTES.RESULTS, {
      summary: {
        gameType: 'logic',
        facultyId: 'logic',
        mode: currentTask?.mode || mode,
        totalRounds: summary.totalRounds,
        averageAccuracy: summary.averageAccuracy,
        averageResponseTimeMs: summary.averageResponseTimeMs,
        bestResponseTimeMs: summary.bestResponseTimeMs,
        score: summary.totalScore,
        bestCombo: summary.bestCombo,
        correctCount: summary.correctCount,
        incorrectCount: summary.incorrectCount,
        timedOutCount: summary.timedOutCount,
        peakLevel: summary.peakLevel,
      },
      elapsedSeconds,
    });
  };

  const handlePauseToggle = () => {
    triggerHaptic('medium');
    setIsPaused((prev) => !prev);
  };

  const handleRestart = () => {
    triggerHaptic('medium');
    Alert.alert('Restart Drill', 'Are you sure you want to reset this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restart',
        style: 'destructive',
        onPress: () => {
          setRoundNumber(1);
          setScore(0);
          setCombo(0);
          setElapsedSeconds(0);
          engine.roundNumber = 0;
          engine.totalScore = 0;
          engine.currentCombo = 0;
          engine.bestCombo = 0;
          engine.sessionHistory = [];
          loadNextRound();
        },
      },
    ]);
  };

  const handleGiveUp = () => {
    triggerHaptic('warning');
    Alert.alert('End Drill', 'Return to dashboard and record completed rounds?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Session',
        style: 'destructive',
        onPress: () => navigateToResults(),
      },
    ]);
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeDetails = LOGIC_MODE_DETAILS[mode] || LOGIC_MODE_DETAILS[LOGIC_MODES.DEDUCTION_GRID];
  const comboMultiplier = getLogicComboMultiplier(combo);
  const arenaWidth = Math.min(width - 48, 330);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} translucent />

      <View style={[styles.container, { paddingTop: topPad }]}>
        {/* ── TOP HEADER ── */}
        <View style={styles.topSection}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGiveUp}
              style={styles.backBtn}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={20} color={P.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerSubtitle}>
                {modeDetails.name.toUpperCase()} · ROUND {roundNumber}
              </Text>
              <Text style={styles.headerTitle}>Logic & Reasoning</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePauseToggle}
              style={styles.pauseBtn}
              accessibilityLabel={isPaused ? 'Resume' : 'Pause'}
            >
              <Ionicons
                name={isPaused ? 'play' : 'pause'}
                size={18}
                color={P.text}
              />
            </TouchableOpacity>
          </View>

          {/* ── HUD METRICS ROW ── */}
          <LinearGradient
            colors={['#F5F2ED', '#EDE9E1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hudRow}
          >
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Score</Text>
              <Text style={styles.hudValue}>{score}</Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Combo</Text>
              <Text style={[styles.hudValue, { color: combo >= 3 ? P.indigo : P.text }]}>
                {combo}x {comboMultiplier > 1 ? `(${comboMultiplier}x)` : ''}
              </Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Tier</Text>
              <Text style={styles.hudValue}>Level {level}</Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Time</Text>
              <Text style={styles.hudValue}>{formatTimer(elapsedSeconds)}</Text>
            </View>
          </LinearGradient>

          {/* Response Countdown Bar */}
          <View style={styles.countdownTrack}>
            <Animated.View
              style={[
                styles.countdownFill,
                {
                  width: countdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* ── CENTER INTERACTIVE LOGIC AREA ── */}
        <View style={styles.centerSection}>
          <ScrollView
            contentContainerStyle={styles.scrollCenter}
            showsVerticalScrollIndicator={false}
          >
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 1: DEDUCTION GRID                                          */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === LOGIC_MODES.DEDUCTION_GRID && currentTask && (
              <View style={styles.gameContainer}>
                {/* Persistent Clues Card */}
                <View style={[styles.cluesContainerCard, { width: arenaWidth }]}>
                  <View style={styles.cluesHeaderRow}>
                    <Ionicons name="document-text-outline" size={16} color={P.indigo} />
                    <Text style={styles.cluesHeaderTitle}>LOGICAL CLUES</Text>
                  </View>
                  {currentTask.clues?.map((clue, cIdx) => (
                    <View key={`clue_${cIdx}`} style={styles.clueBulletRow}>
                      <View style={styles.clueDot} />
                      <Text style={styles.clueBulletText}>{clue.text}</Text>
                    </View>
                  ))}
                </View>

                {/* Target Deduction Question */}
                <View style={styles.promptHeader}>
                  <Text style={styles.promptInstruction}>
                    {roundPhase === 'active'
                      ? currentTask.targetQuestion
                      : feedbackData?.text || 'READY'}
                  </Text>
                  <Text style={styles.promptSubtext}>
                    {roundPhase === 'active'
                      ? currentTask.actionPrompt
                      : feedbackData?.subtext || 'Deduction verified'}
                  </Text>
                </View>

                {/* Candidate Options */}
                <View style={[styles.optionsGrid, { width: arenaWidth }]}>
                  {currentTask.options?.map((opt) => {
                    const isSelected = selectedChoiceId === opt.id;
                    const isCorrect = currentTask.correctOptionId === opt.id;

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.82}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleSelectChoice(opt.id)}
                        style={[
                          styles.optionCard,
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        {opt.hex ? (
                          <View style={styles.optionColorRow}>
                            <View style={[styles.optionColorDot, { backgroundColor: opt.hex }]} />
                            <Text style={styles.optionCardLabel}>{opt.label}</Text>
                          </View>
                        ) : (
                          <Text style={styles.optionCardLabel}>{opt.label}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 2: SEQUENCE LOGIC                                          */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === LOGIC_MODES.SEQUENCE_LOGIC && currentTask && (
              <View style={styles.gameContainer}>
                {/* Sequence Ribbon */}
                <View style={[styles.sequenceRibbonCard, { width: arenaWidth }]}>
                  <Text style={styles.sequenceRibbonLabel}>TRANSFORMATION SEQUENCE</Text>
                  <View style={styles.sequenceItemsRow}>
                    {currentTask.sequence?.map((val, sIdx) => (
                      <View key={`s_${sIdx}`} style={styles.sequenceItemBadge}>
                        <Text style={styles.sequenceItemText}>{val}</Text>
                      </View>
                    ))}
                    <View style={[styles.sequenceItemBadge, styles.sequenceTargetBadge]}>
                      <Text style={styles.sequenceTargetText}>?</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.promptHeader}>
                  <Text style={styles.promptInstruction}>
                    {roundPhase === 'active'
                      ? currentTask.instructionText
                      : feedbackData?.text || 'READY'}
                  </Text>
                  <Text style={styles.promptSubtext}>
                    {roundPhase === 'active'
                      ? currentTask.actionPrompt
                      : feedbackData?.subtext || 'Transformation verified'}
                  </Text>
                </View>

                {/* Candidate Numeric Cards */}
                <View style={[styles.optionsGrid, { width: arenaWidth }]}>
                  {currentTask.options?.map((opt) => {
                    const isSelected = selectedChoiceId === opt.id;
                    const isCorrect = currentTask.correctOptionId === opt.id;

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.82}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleSelectChoice(opt.id)}
                        style={[
                          styles.optionCard,
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        <View style={styles.candidateLetterBadge}>
                          <Text style={styles.candidateLetterText}>{opt.letter}</Text>
                        </View>
                        <Text style={styles.numericOptionText}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 3: CONSTRAINT SOLVER                                       */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === LOGIC_MODES.CONSTRAINT_SOLVER && currentTask && (
              <View style={styles.gameContainer}>
                {/* Active Constraints Checklist Card */}
                <View style={[styles.cluesContainerCard, { width: arenaWidth }]}>
                  <View style={styles.cluesHeaderRow}>
                    <Ionicons name="checkbox-outline" size={16} color={P.indigo} />
                    <Text style={styles.cluesHeaderTitle}>REQUIRED CONSTRAINTS</Text>
                  </View>
                  {currentTask.constraints?.map((con, cIdx) => (
                    <View key={`con_${cIdx}`} style={styles.clueBulletRow}>
                      <Ionicons name="checkmark-circle" size={14} color={P.indigo} />
                      <Text style={styles.clueBulletText}>{con.text}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.promptHeader}>
                  <Text style={styles.promptInstruction}>
                    {roundPhase === 'active'
                      ? currentTask.instructionText
                      : feedbackData?.text || 'READY'}
                  </Text>
                  <Text style={styles.promptSubtext}>
                    {roundPhase === 'active'
                      ? currentTask.actionPrompt
                      : feedbackData?.subtext || 'Constraints verified'}
                  </Text>
                </View>

                {/* Candidate Numeric Cards */}
                <View style={[styles.optionsGrid, { width: arenaWidth }]}>
                  {currentTask.options?.map((opt) => {
                    const isSelected = selectedChoiceId === opt.id;
                    const isCorrect = currentTask.correctOptionId === opt.id;

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.82}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleSelectChoice(opt.id)}
                        style={[
                          styles.optionCard,
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        <View style={styles.candidateLetterBadge}>
                          <Text style={styles.candidateLetterText}>{opt.letter}</Text>
                        </View>
                        <Text style={styles.numericOptionText}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {/* ── BOTTOM CONTROLS ── */}
        <View style={styles.bottomSection}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePauseToggle}
              style={styles.controlBtnSecondary}
            >
              <Text style={styles.controlBtnSecondaryText}>
                {isPaused ? 'Resume' : 'Pause'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRestart}
              style={styles.controlBtnSecondary}
            >
              <Text style={styles.controlBtnSecondaryText}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGiveUp}
              style={styles.controlBtnDanger}
            >
              <Text style={styles.controlBtnDangerText}>End Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: P.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },

  /* ── Header ── */
  topSection: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  pauseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: P.surface,
    borderWidth: 1,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── HUD ── */
  hudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  hudItem: {
    alignItems: 'center',
    flex: 1,
  },
  hudDivider: {
    width: 1,
    height: 22,
    backgroundColor: P.navyBorder,
  },
  hudLabel: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: P.textSec,
    marginBottom: 3,
  },
  hudValue: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: P.text,
  },

  /* ── Countdown Bar ── */
  countdownTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: P.surfaceAlt,
    overflow: 'hidden',
    marginTop: 10,
  },
  countdownFill: {
    height: '100%',
    backgroundColor: P.indigo,
    borderRadius: 2,
  },

  /* ── Center Section ── */
  centerSection: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  gameContainer: {
    alignItems: 'center',
    width: '100%',
  },
  promptHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  promptInstruction: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: P.text,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  promptSubtext: {
    fontSize: 13,
    color: P.textSec,
    textAlign: 'center',
  },

  /* ── Clues / Constraints Card ── */
  cluesContainerCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  cluesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cluesHeaderTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.indigo,
    letterSpacing: 1.2,
  },
  clueBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  clueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: P.indigo,
    marginTop: 6,
  },
  clueBulletText: {
    fontSize: 13,
    fontWeight: typography.weights.medium,
    color: P.text,
    flex: 1,
    lineHeight: 18,
  },

  /* ── Sequence Ribbon UI ── */
  sequenceRibbonCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  sequenceRibbonLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  sequenceItemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  sequenceItemBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    backgroundColor: P.surfaceAlt,
    borderWidth: 1,
    borderColor: P.border,
  },
  sequenceItemText: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: P.navy,
  },
  sequenceTargetBadge: {
    borderColor: P.indigo,
    backgroundColor: P.indigoMuted,
    minWidth: 40,
    alignItems: 'center',
  },
  sequenceTargetText: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: P.indigo,
  },

  /* ── Options Grid ── */
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionCard: {
    width: '48%',
    height: 58,
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 8,
  },
  candidateLetterBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: P.navyMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidateLetterText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.navy,
  },
  numericOptionText: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: P.navy,
  },
  optionCardLabel: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: P.text,
  },
  optionColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  optionCardWin: {
    borderColor: P.sage,
    backgroundColor: P.sageMuted,
  },
  optionCardLoss: {
    borderColor: P.rose,
    backgroundColor: P.roseMuted,
  },

  /* ── Bottom Controls ── */
  bottomSection: {
    paddingTop: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlBtnSecondary: {
    flex: 1,
    height: 44,
    borderRadius: radii.button,
    backgroundColor: P.surface,
    borderWidth: 1,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnSecondaryText: {
    fontSize: 14,
    fontWeight: typography.weights.semibold,
    color: P.text,
  },
  controlBtnDanger: {
    flex: 1,
    height: 44,
    borderRadius: radii.button,
    backgroundColor: P.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnDangerText: {
    fontSize: 14,
    fontWeight: typography.weights.semibold,
    color: P.textInverse,
  },
});
