/**
 * OVERLOAD ProcessingGameScreen
 * Premium Luxury Light Theme — Processing Speed & Visual Information Throughput
 * Supports 3 distinct cognitive processing games:
 * 1. Symbol Match (Dual set comparison: MATCH vs DIFFERENT)
 * 2. Number Scan (Rapid visual search across numerical matrices)
 * 3. Pattern Complete (Visual sequence rule recognition & terminal completion)
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import typography from '../theme/typography';
import spacing, { radii } from '../theme/spacing';
import {
  ProcessingEngine,
  PROCESSING_MODES,
  PROCESSING_MODE_DETAILS,
  SESSION_TYPES,
  getProcessingComboMultiplier,
} from '../games/processing';
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

export default function ProcessingGameScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const mode = route.params?.mode || PROCESSING_MODES.SYMBOL_MATCH;
  const sessionType = route.params?.sessionType || SESSION_TYPES.QUICK;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 8
      : Math.max(insets.top, 20) + 4;

  const [engine] = useState(() => new ProcessingEngine({ mode, sessionType }));
  const [currentTask, setCurrentTask] = useState(null);

  // States: 'active' | 'feedback'
  const [roundPhase, setRoundPhase] = useState('active');
  const [feedbackData, setFeedbackData] = useState(null);
  const [userSelections, setUserSelections] = useState([]);

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
    setUserSelections([]);
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
      subtext: 'Processing window exceeded',
    });

    if (result.isSessionFinished) {
      setTimeout(() => navigateToResults(), 800);
    } else {
      setTimeout(() => loadNextRound(), 750);
    }
  };

  // Submit User Answer
  const handleSubmitResponse = (userResponse) => {
    if (isEvaluatingRef.current || isPaused || !currentTask) return;
    isEvaluatingRef.current = true;

    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    countdownAnim.stopAnimation();

    const responseTimeMs = Date.now() - roundStartTimeRef.current;
    const result = engine.submitResponse(userResponse, responseTimeMs);

    setScore(result.totalScore);
    setCombo(result.currentCombo);
    setLevel(engine.currentLevel);
    setRoundPhase('feedback');

    if (result.evaluation.isCorrect) {
      triggerHaptic('success');
      setFeedbackData({
        isCorrect: true,
        text: `${Math.round(responseTimeMs)} ms`,
        subtext:
          responseTimeMs < 1200
            ? 'Swift Processing!'
            : responseTimeMs < 2000
            ? 'Accurate & Fast'
            : 'Correct Match',
      });
    } else {
      triggerHaptic('error');
      setFeedbackData({
        isCorrect: false,
        text: result.evaluation.feedbackMessage || 'INCORRECT',
        subtext: 'Processing mismatch · Stay focused',
      });
    }

    if (result.isSessionFinished) {
      setTimeout(() => navigateToResults(), 750);
    } else {
      setTimeout(() => loadNextRound(), result.evaluation.isCorrect ? 550 : 850);
    }
  };

  // ── GAME 2: NUMBER SCAN TOUCH HANDLER ──
  const handleNumberCellPress = (index) => {
    if (roundPhase !== 'active' || isPaused || isEvaluatingRef.current) return;

    triggerHaptic('light');
    const targetCount = currentTask?.targetInstanceCount || 1;

    if (targetCount === 1) {
      setUserSelections([index]);
      handleSubmitResponse([index]);
    } else {
      const nextSelections = userSelections.includes(index)
        ? userSelections.filter((i) => i !== index)
        : [...userSelections, index];

      setUserSelections(nextSelections);

      if (nextSelections.length === targetCount) {
        handleSubmitResponse(nextSelections);
      }
    }
  };

  const navigateToResults = () => {
    const summary = engine.getSessionSummary();
    navigation.replace(ROUTES.RESULTS, {
      summary: {
        gameType: 'processing',
        facultyId: 'processing',
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

  const modeDetails = PROCESSING_MODE_DETAILS[mode] || PROCESSING_MODE_DETAILS[PROCESSING_MODES.SYMBOL_MATCH];
  const comboMultiplier = getProcessingComboMultiplier(combo);
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
              <Text style={styles.headerTitle}>Processing Speed</Text>
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

        {/* ── CENTER SECTION ── */}
        <View style={styles.centerSection}>
          {/* ══════════════════════════════════════════════════════════════ */}
          {/* GAME 1: SYMBOL MATCH (Dual Comparison Panels)                  */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === PROCESSING_MODES.SYMBOL_MATCH && currentTask && (
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
                    : feedbackData?.subtext || 'Processing evaluation...'}
                </Text>
              </View>

              {/* Dual Panels Comparison Card */}
              <View style={[styles.comparisonCard, { width: arenaWidth }]}>
                {/* Left Panel */}
                <View style={styles.comparisonSetContainer}>
                  <Text style={styles.comparisonSetLabel}>SET A</Text>
                  <View style={styles.symbolRow}>
                    {currentTask.leftSet?.map((s) => (
                      <Text key={s.id} style={[styles.comparisonSymbol, { color: s.color }]}>
                        {s.shape}
                      </Text>
                    ))}
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.comparisonDividerRow}>
                  <View style={styles.comparisonDividerLine} />
                  <Text style={styles.comparisonDividerText}>VS</Text>
                  <View style={styles.comparisonDividerLine} />
                </View>

                {/* Right Panel */}
                <View style={styles.comparisonSetContainer}>
                  <Text style={styles.comparisonSetLabel}>SET B</Text>
                  <View style={styles.symbolRow}>
                    {currentTask.rightSet?.map((s) => (
                      <Text key={s.id} style={[styles.comparisonSymbol, { color: s.color }]}>
                        {s.shape}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              {/* Action Buttons: MATCH vs DIFFERENT */}
              <View style={[styles.symbolMatchActionsRow, { width: arenaWidth }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isPaused || isEvaluatingRef.current}
                  onPress={() => handleSubmitResponse('match')}
                  style={[styles.matchActionBtn, styles.matchBtnPrimary]}
                  accessibilityRole="button"
                  accessibilityLabel="Match identical"
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={P.textInverse} />
                  <Text style={styles.matchBtnText}>MATCH</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isPaused || isEvaluatingRef.current}
                  onPress={() => handleSubmitResponse('different')}
                  style={[styles.matchActionBtn, styles.matchBtnSecondary]}
                  accessibilityRole="button"
                  accessibilityLabel="Different symbols"
                >
                  <Ionicons name="close-circle-outline" size={20} color={P.text} />
                  <Text style={styles.matchBtnSecondaryText}>DIFFERENT</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* GAME 2: NUMBER SCAN (Visual Number Matrix Search)             */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === PROCESSING_MODES.NUMBER_SCAN && currentTask && (
            <View style={styles.gameContainer}>
              {/* Target Banner */}
              <View style={[styles.scanTargetBanner, { width: arenaWidth }]}>
                <View>
                  <Text style={styles.scanTargetLabel}>SEARCH TARGET</Text>
                  <Text style={styles.scanTargetTitle}>{currentTask.actionPrompt}</Text>
                </View>
                <View style={styles.scanTargetBadge}>
                  <Text style={styles.scanTargetBadgeText}>{currentTask.targetNumber}</Text>
                </View>
              </View>

              {/* Number Matrix Grid */}
              <View style={[styles.numberGrid, { width: arenaWidth }]}>
                {currentTask.gridCells?.map((cell) => {
                  const cols = currentTask.cols || 3;
                  const itemDim = Math.floor((arenaWidth - (cols - 1) * 8) / cols);
                  const isSelected = userSelections.includes(cell.index);

                  return (
                    <TouchableOpacity
                      key={cell.id}
                      activeOpacity={0.8}
                      disabled={isPaused || isEvaluatingRef.current}
                      onPress={() => handleNumberCellPress(cell.index)}
                      style={[
                        styles.numberCell,
                        {
                          width: itemDim,
                          height: itemDim * 0.95,
                          borderColor: isSelected ? P.navy : P.border,
                          backgroundColor: isSelected ? P.navyMuted : P.surface,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Number ${cell.value}`}
                    >
                      <Text style={styles.numberCellText}>{cell.value}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* GAME 3: PATTERN COMPLETE (Visual Sequence Terminal Rule)       */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === PROCESSING_MODES.PATTERN_COMPLETE && currentTask && (
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
                    : feedbackData?.subtext || 'Processing evaluation...'}
                </Text>
              </View>

              {/* Sequence Display Line */}
              <View style={[styles.patternSequenceCard, { width: arenaWidth }]}>
                <View style={styles.patternSequenceRow}>
                  {currentTask.sequenceItems?.map((item) => (
                    <View key={item.id} style={styles.patternSequenceItem}>
                      <Text style={styles.patternItemText}>{item.display}</Text>
                    </View>
                  ))}
                  <View style={styles.patternTerminalUnknown}>
                    <Text style={styles.patternTerminalUnknownText}>?</Text>
                  </View>
                </View>
              </View>

              {/* 4 Choices Grid */}
              <Text style={styles.patternChoicesTitle}>SELECT TERMINAL ELEMENT</Text>
              <View style={[styles.patternChoicesRow, { width: arenaWidth }]}>
                {currentTask.choices?.map((choice, index) => {
                  const choiceWidth = Math.floor((arenaWidth - 12) / 2);
                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      disabled={isPaused || isEvaluatingRef.current}
                      onPress={() => handleSubmitResponse(index)}
                      style={[styles.patternChoiceCard, { width: choiceWidth }]}
                      accessibilityRole="button"
                      accessibilityLabel={`Choice ${choice.display}`}
                    >
                      <Text style={styles.patternChoiceText}>{choice.display}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  gameContainer: {
    alignItems: 'center',
    width: '100%',
  },
  promptHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  promptInstruction: {
    fontSize: 20,
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

  /* ── Symbol Match UI ── */
  comparisonCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  comparisonSetContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  comparisonSetLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  symbolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  comparisonSymbol: {
    fontSize: 30,
    fontWeight: typography.weights.bold,
  },
  comparisonDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 10,
  },
  comparisonDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: P.border,
  },
  comparisonDividerText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.textMuted,
    letterSpacing: 1,
  },
  symbolMatchActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  matchActionBtn: {
    flex: 1,
    height: 52,
    borderRadius: radii.button,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  matchBtnPrimary: {
    backgroundColor: P.navy,
  },
  matchBtnText: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: P.textInverse,
    letterSpacing: 1,
  },
  matchBtnSecondary: {
    backgroundColor: P.surface,
    borderWidth: 1.5,
    borderColor: P.border,
  },
  matchBtnSecondaryText: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: 1,
  },

  /* ── Number Scan UI ── */
  scanTargetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 16,
    marginBottom: 16,
  },
  scanTargetLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  scanTargetTitle: {
    fontSize: 17,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
  },
  scanTargetBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: P.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTargetBadgeText: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: P.textInverse,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  numberCell: {
    borderRadius: radii.md,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  numberCellText: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: P.text,
  },

  /* ── Pattern Complete UI ── */
  patternSequenceCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternSequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  patternSequenceItem: {
    width: 44,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: P.surfaceAlt,
    borderWidth: 1,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternItemText: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: P.text,
  },
  patternTerminalUnknown: {
    width: 44,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: P.navyMuted,
    borderWidth: 1.5,
    borderColor: P.navy,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternTerminalUnknownText: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: P.navy,
  },
  patternChoicesTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  patternChoicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  patternChoiceCard: {
    height: 56,
    borderRadius: radii.card,
    backgroundColor: P.surface,
    borderWidth: 1.5,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  patternChoiceText: {
    fontSize: 24,
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
