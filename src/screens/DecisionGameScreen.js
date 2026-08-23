/**
 * OVERLOAD DecisionGameScreen
 * Premium Luxury Light Theme — Decision Making & Executive Function
 * Supports 3 distinct cognitive decision games:
 * 1. Priority Sort (Evaluate competing priorities across urgency, impact, and deadlines)
 * 2. Best Choice (Goal-directed multi-attribute constraint satisfaction)
 * 3. Rule Switch (Cognitive flexibility under dynamic conditional rules)
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
  DecisionEngine,
  DECISION_MODES,
  DECISION_MODE_DETAILS,
  SESSION_TYPES,
  getDecisionComboMultiplier,
} from '../games/decision';
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
  dangerDark: '#A86062',
};

export default function DecisionGameScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const mode = route.params?.mode || DECISION_MODES.PRIORITY_SORT;
  const sessionType = route.params?.sessionType || SESSION_TYPES.QUICK;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 8
      : Math.max(insets.top, 20) + 4;

  const [engine] = useState(() => new DecisionEngine({ mode, sessionType }));
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

    // Start animated countdown bar
    countdownAnim.setValue(1);
    Animated.timing(countdownAnim, {
      toValue: 0,
      duration: task.timeoutWindowMs,
      useNativeDriver: false,
    }).start();

    // Start response timeout window
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
      subtext: 'Decision window exceeded',
    });

    if (result.isSessionFinished) {
      setTimeout(() => navigateToResults(), 800);
    } else {
      setTimeout(() => loadNextRound(), 750);
    }
  };

  // Submit User Decision
  const handleSelectChoice = (choiceId) => {
    if (isEvaluatingRef.current || isPaused || !currentTask) return;
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
        text: result.evaluation.feedbackMessage || 'CORRECT PRIORITY',
        subtext: result.evaluation.rationale || `${Math.round(responseTimeMs)} ms · High Quality`,
      });
    } else {
      triggerHaptic('error');
      setFeedbackData({
        isCorrect: false,
        text: result.evaluation.feedbackMessage || 'NOT QUITE',
        subtext: result.evaluation.rationale || 'Consider urgency and impact constraints',
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
        gameType: 'decision',
        facultyId: 'decision',
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

  const modeDetails = DECISION_MODE_DETAILS[mode] || DECISION_MODE_DETAILS[DECISION_MODES.PRIORITY_SORT];
  const comboMultiplier = getDecisionComboMultiplier(combo);
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
              <Text style={styles.headerTitle}>Decision Making</Text>
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
              <Text style={[styles.hudValue, { color: combo >= 3 ? P.gold : P.text }]}>
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

        {/* ── CENTER INTERACTIVE DECISION AREA ── */}
        <View style={styles.centerSection}>
          <ScrollView
            contentContainerStyle={styles.scrollCenter}
            showsVerticalScrollIndicator={false}
          >
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 1: PRIORITY SORT                                          */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === DECISION_MODES.PRIORITY_SORT && currentTask && (
              <View style={styles.gameContainer}>
                <View style={styles.promptHeader}>
                  <Text style={styles.promptInstruction}>
                    {roundPhase === 'active'
                      ? currentTask.instructionText
                      : feedbackData?.text || 'READY'}
                  </Text>
                  <Text style={styles.promptSubtext}>
                    {roundPhase === 'active'
                      ? currentTask.actionPrompt
                      : feedbackData?.subtext || 'Evaluating task priorities...'}
                  </Text>
                </View>

                {/* Priority Task Cards */}
                <View style={[styles.decisionOptionsContainer, { width: arenaWidth }]}>
                  {currentTask.tasks?.map((task) => {
                    const isSelected = selectedChoiceId === task.id;
                    const isCorrect = currentTask.correctTaskId === task.id;
                    const showFeedback = roundPhase === 'feedback';

                    return (
                      <TouchableOpacity
                        key={task.id}
                        activeOpacity={0.82}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleSelectChoice(task.id)}
                        style={[
                          styles.priorityCard,
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        <View style={styles.priorityTopRow}>
                          <View style={styles.riskLetterBadge}>
                            <Text style={styles.riskLetterText}>{task.letter}</Text>
                          </View>
                          <Text style={styles.priorityTaskTitle} numberOfLines={1}>
                            {task.title}
                          </Text>
                        </View>

                        <View style={styles.priorityAttributesGrid}>
                          <View style={styles.priorityAttrPill}>
                            <Text style={styles.priorityAttrLabel}>IMPORTANCE</Text>
                            <Text
                              style={[
                                styles.priorityAttrValue,
                                { color: task.importance === 'CRITICAL' || task.importance === 'HIGH' ? P.navy : P.textSec },
                              ]}
                            >
                              {task.importance}
                            </Text>
                          </View>
                          <View style={styles.priorityAttrPill}>
                            <Text style={styles.priorityAttrLabel}>URGENCY</Text>
                            <Text
                              style={[
                                styles.priorityAttrValue,
                                { color: task.urgency === 'IMMEDIATE' || task.urgency === 'HIGH' ? P.danger : P.textSec },
                              ]}
                            >
                              {task.urgency}
                            </Text>
                          </View>
                          <View style={styles.priorityAttrPill}>
                            <Text style={styles.priorityAttrLabel}>DEADLINE</Text>
                            <Text style={styles.priorityAttrValue}>{task.deadline}</Text>
                          </View>
                        </View>

                        {task.blocksDependency && (
                          <View style={styles.dependencyTag}>
                            <Ionicons name="link-outline" size={12} color={P.gold} />
                            <Text style={styles.dependencyText}>Blocks other tasks</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 2: BEST CHOICE                                            */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === DECISION_MODES.BEST_CHOICE && currentTask && (
              <View style={styles.gameContainer}>
                {/* Target Constraint Banner */}
                <View style={[styles.constraintBanner, { width: arenaWidth }]}>
                  <Text style={styles.constraintLabel}>TARGET OBJECTIVE</Text>
                  <Text style={styles.constraintTitle}>{currentTask.rulePrompt}</Text>
                </View>

                {/* Options List */}
                <View style={[styles.decisionOptionsContainer, { width: arenaWidth }]}>
                  {currentTask.options?.map((option) => {
                    const isSelected = selectedChoiceId === option.id;
                    const isCorrect = currentTask.correctOptionId === option.id;

                    return (
                      <TouchableOpacity
                        key={option.id}
                        activeOpacity={0.82}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleSelectChoice(option.id)}
                        style={[
                          styles.bestChoiceCard,
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        <View style={styles.bestChoiceHeader}>
                          <View style={styles.riskLetterBadge}>
                            <Text style={styles.riskLetterText}>{option.letter}</Text>
                          </View>
                          <View style={styles.bestChoiceStatsRow}>
                            <View style={styles.bestStatPill}>
                              <Text style={styles.bestStatLabel}>VALUE</Text>
                              <Text style={styles.bestStatVal}>{option.value}</Text>
                            </View>
                            <View style={styles.bestStatPill}>
                              <Text style={styles.bestStatLabel}>COST</Text>
                              <Text style={styles.bestStatVal}>{option.cost}</Text>
                            </View>
                            <View style={styles.bestStatPill}>
                              <Text style={styles.bestStatLabel}>RISK</Text>
                              <Text style={styles.bestStatVal}>{option.risk}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 3: RULE SWITCH                                            */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === DECISION_MODES.RULE_SWITCH && currentTask && (
              <View style={styles.gameContainer}>
                {/* Active Dynamic Rule Banner */}
                <View
                  style={[
                    styles.ruleSwitchBanner,
                    { width: arenaWidth, borderColor: currentTask.activeModifier?.hex || P.navy },
                  ]}
                >
                  <Text style={styles.ruleSwitchLabel}>ACTIVE CONDITIONAL RULE</Text>
                  <Text
                    style={[
                      styles.ruleSwitchTitle,
                      { color: currentTask.activeModifier?.hex || P.navy },
                    ]}
                  >
                    {currentTask.rulePrompt}
                  </Text>
                </View>

                {/* Numerical Option Cards */}
                <View style={[styles.ruleNumbersGrid, { width: arenaWidth }]}>
                  {currentTask.options?.map((option) => {
                    const isSelected = selectedChoiceId === option.id;
                    const isCorrect = currentTask.correctOptionId === option.id;
                    const showFeedback = roundPhase === 'feedback';

                    return (
                      <TouchableOpacity
                        key={option.id}
                        activeOpacity={0.82}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleSelectChoice(option.id)}
                        style={[
                          styles.ruleNumberCard,
                          {
                            borderColor: showFeedback && isSelected
                              ? isCorrect
                                ? P.sage
                                : P.rose
                              : currentTask.activeModifier?.hex || P.border,
                            backgroundColor: showFeedback && isSelected
                              ? isCorrect
                                ? P.sageMuted
                                : P.roseMuted
                              : P.surface,
                          },
                        ]}
                      >
                        <Text style={styles.ruleNumberText}>{option.value}</Text>
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
    backgroundColor: P.navy,
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
    marginBottom: 16,
  },
  promptInstruction: {
    fontSize: 19,
    fontWeight: typography.weights.bold,
    color: P.text,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  promptSubtext: {
    fontSize: 13,
    color: P.textSec,
    textAlign: 'center',
  },

  /* ── Priority Sort Cards ── */
  decisionOptionsContainer: {
    gap: 12,
  },
  priorityCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 14,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  priorityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  priorityTaskTitle: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: P.text,
    flex: 1,
  },
  priorityAttributesGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityAttrPill: {
    flex: 1,
    backgroundColor: P.surfaceAlt,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
  },
  priorityAttrLabel: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  priorityAttrValue: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.text,
  },
  dependencyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: P.border,
  },
  dependencyText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: P.gold,
  },

  optionCardWin: {
    borderColor: P.sage,
    backgroundColor: P.sageMuted,
  },
  optionCardLoss: {
    borderColor: P.rose,
    backgroundColor: P.roseMuted,
  },
  riskLetterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: P.navyMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskLetterText: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: P.navy,
  },

  /* ── Best Choice UI ── */
  constraintBanner: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  constraintLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  constraintTitle: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: P.navy,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  bestChoiceCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 12,
  },
  bestChoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bestChoiceStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bestStatPill: {
    backgroundColor: P.surfaceAlt,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  bestStatLabel: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 0.8,
  },
  bestStatVal: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: P.text,
  },

  /* ── Rule Switch UI ── */
  ruleSwitchBanner: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 2,
    padding: 16,
    marginBottom: 18,
    alignItems: 'center',
  },
  ruleSwitchLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  ruleSwitchTitle: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  ruleNumbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  ruleNumberCard: {
    width: 140,
    height: 90,
    borderRadius: radii.card,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  ruleNumberText: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: P.text,
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
