/**
 * OVERLOAD ReactionGameScreen
 * Premium Luxury Light Theme — Reaction Speed & Neural Latency Interface
 * Supports 3 distinct cognitive reaction games:
 * 1. Target Tap (Visual detection + motor response with randomized spatial offsets)
 * 2. Rapid Choice (Visual discrimination & rapid decision speed)
 * 3. Direction Reaction (Visual directional mapping onto 4-way physical touch controls)
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
  ReactionEngine,
  REACTION_MODES,
  REACTION_MODE_DETAILS,
  SESSION_TYPES,
  getReactionComboMultiplier,
  DIRECTION_DEFINITIONS,
} from '../games/reaction';
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

export default function ReactionGameScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const mode = route.params?.mode || REACTION_MODES.TARGET_TAP;
  const sessionType = route.params?.sessionType || SESSION_TYPES.QUICK;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 8
      : Math.max(insets.top, 20) + 4;

  const [engine] = useState(() => new ReactionEngine({ mode, sessionType }));
  const [currentTask, setCurrentTask] = useState(null);

  // States: 'waiting' | 'stimulus' | 'feedback'
  const [roundPhase, setRoundPhase] = useState('waiting');
  const [feedbackData, setFeedbackData] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [roundNumber, setRoundNumber] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isEvaluatingRef = useRef(false);
  const delayTimerRef = useRef(null);
  const timeoutTimerRef = useRef(null);
  const stimulusTimestampRef = useRef(0);

  // Pulse animation for waiting state
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Session clock
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, []);

  // Animate pulse during waiting
  useEffect(() => {
    if (roundPhase === 'waiting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.96,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [roundPhase, pulseAnim]);

  // Load next round
  const loadNextRound = useCallback(() => {
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

    const task = engine.startNextTask();
    setCurrentTask(task);
    setRoundNumber(engine.roundNumber);
    setLevel(engine.currentLevel);
    setRoundPhase('waiting');
    setFeedbackData(null);
    setSelectedResponse(null);
    isEvaluatingRef.current = false;
    stimulusTimestampRef.current = 0;

    // Start pre-stimulus delay timer
    delayTimerRef.current = setTimeout(() => {
      if (isEvaluatingRef.current || isPaused) return;

      // Stimulus becomes interactive and high-resolution timer begins
      stimulusTimestampRef.current = Date.now();
      setRoundPhase('stimulus');
      triggerHaptic('light');

      // Start response timeout window
      timeoutTimerRef.current = setTimeout(() => {
        if (!isEvaluatingRef.current && !isPaused) {
          handleTimeout(task);
        }
      }, task.timeoutWindowMs);
    }, task.stimulusDelayMs);
  }, [engine, isPaused]);

  useEffect(() => {
    loadNextRound();
  }, []);

  // Handle False Start (Tapped during waiting)
  const handleFalseStart = () => {
    if (isEvaluatingRef.current || isPaused) return;
    isEvaluatingRef.current = true;

    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

    triggerHaptic('warning');
    const result = engine.handleFalseStart();

    setScore(result.totalScore);
    setCombo(result.currentCombo);
    setRoundPhase('feedback');
    setFeedbackData({
      isCorrect: false,
      isFalseStart: true,
      text: 'TOO EARLY',
      subtext: 'Penalty applied · Wait for the stimulus onset',
    });

    if (result.isSessionFinished) {
      setTimeout(() => navigateToResults(), 800);
    } else {
      setTimeout(() => loadNextRound(), 750);
    }
  };

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
      subtext: 'No response detected within timeout limit',
    });

    if (result.isSessionFinished) {
      setTimeout(() => navigateToResults(), 800);
    } else {
      setTimeout(() => loadNextRound(), 750);
    }
  };

  // Handle User Reaction Tap
  const handleUserTap = (userResponse = null) => {
    if (isEvaluatingRef.current || isPaused || !currentTask) return;

    if (roundPhase === 'waiting') {
      handleFalseStart();
      return;
    }

    if (roundPhase !== 'stimulus') return;

    isEvaluatingRef.current = true;
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

    const reactionTimeMs = Date.now() - stimulusTimestampRef.current;
    const result = engine.submitResponse({
      userResponse,
      responseTimeMs: reactionTimeMs,
    });

    setScore(result.totalScore);
    setCombo(result.currentCombo);
    setLevel(engine.currentLevel);
    setSelectedResponse(userResponse);
    setRoundPhase('feedback');

    if (result.evaluation.isCorrect) {
      triggerHaptic('success');
      setFeedbackData({
        isCorrect: true,
        text: `${Math.round(reactionTimeMs)} ms`,
        subtext:
          reactionTimeMs < 200
            ? 'Apex Reflex!'
            : reactionTimeMs < 280
            ? 'Fast Reaction'
            : 'Good Hit',
      });
    } else {
      triggerHaptic('error');
      setFeedbackData({
        isCorrect: false,
        text: result.evaluation.feedbackMessage || 'INCORRECT',
        subtext: 'Selection mismatch · Maintain focus',
      });
    }

    if (result.isSessionFinished) {
      setTimeout(() => navigateToResults(), 750);
    } else {
      setTimeout(() => loadNextRound(), result.evaluation.isCorrect ? 550 : 800);
    }
  };

  const navigateToResults = () => {
    const summary = engine.getSessionSummary();
    navigation.replace(ROUTES.RESULTS, {
      summary: {
        gameType: 'reaction',
        facultyId: 'reaction',
        mode: currentTask?.mode || mode,
        totalRounds: summary.totalRounds,
        averageAccuracy: summary.averageAccuracy,
        averageResponseTimeMs: summary.averageReactionTimeMs,
        bestReactionTimeMs: summary.bestReactionTimeMs,
        score: summary.totalScore,
        bestCombo: summary.bestCombo,
        correctCount: summary.correctCount,
        incorrectCount: summary.incorrectCount,
        falseStartCount: summary.falseStartCount,
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

  const modeDetails = REACTION_MODE_DETAILS[mode] || REACTION_MODE_DETAILS[REACTION_MODES.TARGET_TAP];
  const comboMultiplier = getReactionComboMultiplier(combo);
  const arenaWidth = Math.min(width - 48, 320);

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
              <Text style={styles.headerTitle}>Reaction Speed</Text>
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
        </View>

        {/* ── CENTER INTERACTIVE REACTION AREA ── */}
        <View style={styles.centerSection}>
          {/* ══════════════════════════════════════════════════════════════ */}
          {/* GAME 1: TARGET TAP                                            */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === REACTION_MODES.TARGET_TAP && currentTask && (
            <View style={styles.gameContainer}>
              <View style={styles.promptHeader}>
                <Text style={styles.promptInstruction}>
                  {roundPhase === 'waiting'
                    ? 'WAIT FOR TARGET...'
                    : roundPhase === 'stimulus'
                    ? 'TAP TARGET NOW!'
                    : feedbackData?.text || 'READY'}
                </Text>
                <Text style={styles.promptSubtext}>
                  {roundPhase === 'waiting'
                    ? 'Do not tap early · Randomized onset delay'
                    : roundPhase === 'stimulus'
                    ? 'Tap the stimulus immediately'
                    : feedbackData?.subtext || 'Processing reaction...'}
                </Text>
              </View>

              {/* Arena Area */}
              <TouchableOpacity
                activeOpacity={1}
                disabled={isPaused || roundPhase === 'feedback'}
                onPress={() => handleUserTap()}
                style={[
                  styles.arenaBox,
                  { width: arenaWidth, height: arenaWidth },
                  roundPhase === 'waiting' && styles.arenaWaiting,
                ]}
              >
                {roundPhase === 'waiting' && (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
                    <Ionicons name="hourglass-outline" size={38} color={P.textSec} />
                    <Text style={styles.arenaWaitingText}>WAITING FOR ONSET</Text>
                  </Animated.View>
                )}

                {roundPhase === 'stimulus' && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleUserTap()}
                    style={[
                      styles.targetCircle,
                      {
                        width: currentTask.target.size,
                        height: currentTask.target.size,
                        borderRadius: currentTask.target.size / 2,
                        backgroundColor: currentTask.target.color,
                        transform: [
                          { translateX: currentTask.target.offsetX * (arenaWidth * 0.35) },
                          { translateY: currentTask.target.offsetY * (arenaWidth * 0.35) },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.targetSymbol}>{currentTask.target.shape}</Text>
                  </TouchableOpacity>
                )}

                {roundPhase === 'feedback' && (
                  <View style={styles.feedbackBox}>
                    <Ionicons
                      name={feedbackData?.isCorrect ? 'flash' : 'alert-circle'}
                      size={42}
                      color={feedbackData?.isCorrect ? P.sage : P.rose}
                    />
                    <Text
                      style={[
                        styles.feedbackText,
                        { color: feedbackData?.isCorrect ? P.sage : P.rose },
                      ]}
                    >
                      {feedbackData?.text}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* GAME 2: RAPID CHOICE                                          */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === REACTION_MODES.RAPID_CHOICE && currentTask && (
            <View style={styles.gameContainer}>
              {/* Target Prompt Banner */}
              <View style={styles.choicePromptCard}>
                <View style={styles.choicePromptLeft}>
                  <Text style={styles.choicePromptLabel}>TARGET SYMBOL</Text>
                  <Text style={styles.choicePromptTitle}>
                    {currentTask.instructionText}
                  </Text>
                </View>
                <View style={styles.choicePromptSymbolBadge}>
                  <Text style={styles.choicePromptSymbolText}>
                    {currentTask.targetSymbol}
                  </Text>
                </View>
              </View>

              {/* Choices Field */}
              <View
                style={[
                  styles.choicesGrid,
                  { width: arenaWidth, minHeight: arenaWidth * 0.8 },
                ]}
              >
                {roundPhase === 'waiting' ? (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => handleFalseStart()}
                    style={styles.choiceWaitingOverlay}
                  >
                    <Ionicons name="eye-outline" size={36} color={P.textMuted} />
                    <Text style={styles.choiceWaitingText}>Preparing stimuli...</Text>
                  </TouchableOpacity>
                ) : (
                  currentTask.choices?.map((choice, index) => {
                    const cols = currentTask.gridCols || 2;
                    const itemDim = Math.floor((arenaWidth - (cols - 1) * 12) / cols);

                    const isSelected = selectedResponse === index;
                    const showCorrect = feedbackData?.isCorrect && isSelected;
                    const showError = !feedbackData?.isCorrect && isSelected;

                    return (
                      <TouchableOpacity
                        key={choice.id}
                        activeOpacity={0.8}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleUserTap(index)}
                        style={[
                          styles.choiceCard,
                          {
                            width: itemDim,
                            height: itemDim * 0.9,
                            borderColor: showCorrect
                              ? P.sage
                              : showError
                              ? P.rose
                              : P.border,
                            backgroundColor: showCorrect
                              ? P.sageMuted
                              : showError
                              ? P.roseMuted
                              : P.surface,
                          },
                        ]}
                      >
                        <Text style={[styles.choiceSymbol, { color: choice.color }]}>
                          {choice.shape}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* GAME 3: DIRECTION REACTION (4-Way Directional Cross Pad)       */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === REACTION_MODES.DIRECTION_REACTION && currentTask && (
            <View style={styles.gameContainer}>
              {/* Central Visual Stimulus Banner */}
              <View style={[styles.directionStimulusCard, { width: arenaWidth }]}>
                {roundPhase === 'waiting' ? (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
                    <Ionicons name="compass-outline" size={32} color={P.textSec} />
                    <Text style={styles.directionWaitingText}>WAIT FOR ARROW</Text>
                  </Animated.View>
                ) : roundPhase === 'stimulus' ? (
                  <View style={styles.directionStimulusInner}>
                    <Text style={[styles.directionArrowText, { color: currentTask.color }]}>
                      {currentTask.targetDirection.symbol}
                    </Text>
                    <Text style={styles.directionLabelText}>
                      {currentTask.targetDirection.label}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.directionFeedbackInner}>
                    <Ionicons
                      name={feedbackData?.isCorrect ? 'flash' : 'alert-circle'}
                      size={32}
                      color={feedbackData?.isCorrect ? P.sage : P.rose}
                    />
                    <Text
                      style={[
                        styles.directionFeedbackText,
                        { color: feedbackData?.isCorrect ? P.sage : P.rose },
                      ]}
                    >
                      {feedbackData?.text}
                    </Text>
                  </View>
                )}
              </View>

              {/* 4-Way Directional Touch Pad Controls */}
              <View style={[styles.dpadContainer, { width: arenaWidth, height: arenaWidth * 0.85 }]}>
                {/* UP Button */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  disabled={isPaused || roundPhase === 'feedback'}
                  onPress={() => handleUserTap(DIRECTION_DEFINITIONS.UP.id)}
                  style={[
                    styles.dpadBtn,
                    styles.dpadBtnUp,
                    selectedResponse === DIRECTION_DEFINITIONS.UP.id &&
                      (feedbackData?.isCorrect ? styles.dpadBtnSuccess : styles.dpadBtnError),
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Up direction"
                >
                  <Ionicons name="arrow-up" size={28} color={P.navy} />
                </TouchableOpacity>

                {/* Middle Row (LEFT, CENTER HUB, RIGHT) */}
                <View style={styles.dpadMiddleRow}>
                  {/* LEFT Button */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    disabled={isPaused || roundPhase === 'feedback'}
                    onPress={() => handleUserTap(DIRECTION_DEFINITIONS.LEFT.id)}
                    style={[
                      styles.dpadBtn,
                      styles.dpadBtnLeft,
                      selectedResponse === DIRECTION_DEFINITIONS.LEFT.id &&
                        (feedbackData?.isCorrect ? styles.dpadBtnSuccess : styles.dpadBtnError),
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Left direction"
                  >
                    <Ionicons name="arrow-back" size={28} color={P.navy} />
                  </TouchableOpacity>

                  {/* Center Pivot Hub */}
                  <View style={styles.dpadCenterPivot}>
                    <View style={styles.dpadCenterDot} />
                  </View>

                  {/* RIGHT Button */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    disabled={isPaused || roundPhase === 'feedback'}
                    onPress={() => handleUserTap(DIRECTION_DEFINITIONS.RIGHT.id)}
                    style={[
                      styles.dpadBtn,
                      styles.dpadBtnRight,
                      selectedResponse === DIRECTION_DEFINITIONS.RIGHT.id &&
                        (feedbackData?.isCorrect ? styles.dpadBtnSuccess : styles.dpadBtnError),
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Right direction"
                  >
                    <Ionicons name="arrow-forward" size={28} color={P.navy} />
                  </TouchableOpacity>
                </View>

                {/* DOWN Button */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  disabled={isPaused || roundPhase === 'feedback'}
                  onPress={() => handleUserTap(DIRECTION_DEFINITIONS.DOWN.id)}
                  style={[
                    styles.dpadBtn,
                    styles.dpadBtnDown,
                    selectedResponse === DIRECTION_DEFINITIONS.DOWN.id &&
                      (feedbackData?.isCorrect ? styles.dpadBtnSuccess : styles.dpadBtnError),
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Down direction"
                >
                  <Ionicons name="arrow-down" size={28} color={P.navy} />
                </TouchableOpacity>
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
    marginBottom: 22,
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

  /* ── Target Tap UI ── */
  arenaBox: {
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: P.border,
    backgroundColor: P.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  arenaWaiting: {
    backgroundColor: P.surfaceAlt,
    borderStyle: 'dashed',
  },
  arenaWaitingText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginTop: 8,
  },
  targetCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  targetSymbol: {
    fontSize: 34,
    color: P.textInverse,
    fontWeight: typography.weights.bold,
  },
  feedbackBox: {
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    marginTop: 6,
    letterSpacing: -0.3,
  },

  /* ── Rapid Choice UI ── */
  choicePromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: P.border,
    padding: 16,
    marginBottom: 20,
  },
  choicePromptLeft: {
    flex: 1,
  },
  choicePromptLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  choicePromptTitle: {
    fontSize: 17,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
  },
  choicePromptSymbolBadge: {
    width: 50,
    height: 50,
    borderRadius: radii.sm,
    backgroundColor: P.navyMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  choicePromptSymbolText: {
    fontSize: 26,
    color: P.navy,
    fontWeight: typography.weights.bold,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  choiceWaitingOverlay: {
    width: '100%',
    height: 200,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: P.surfaceAlt,
  },
  choiceWaitingText: {
    fontSize: 13,
    fontWeight: typography.weights.medium,
    color: P.textSec,
    marginTop: 8,
  },
  choiceCard: {
    borderRadius: radii.card,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  choiceSymbol: {
    fontSize: 34,
    fontWeight: typography.weights.bold,
  },

  /* ── Direction Reaction UI ── */
  directionStimulusCard: {
    height: 100,
    borderRadius: radii.card,
    backgroundColor: P.surface,
    borderWidth: 1.5,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  directionWaitingText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginTop: 6,
  },
  directionStimulusInner: {
    alignItems: 'center',
  },
  directionArrowText: {
    fontSize: 40,
    fontWeight: typography.weights.bold,
    lineHeight: 44,
  },
  directionLabelText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: P.navy,
    letterSpacing: 2,
    marginTop: 2,
  },
  directionFeedbackInner: {
    alignItems: 'center',
  },
  directionFeedbackText: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    marginTop: 4,
    letterSpacing: -0.3,
  },

  /* D-Pad Touch Controls */
  dpadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 10,
  },
  dpadBtn: {
    width: 68,
    height: 68,
    borderRadius: radii.card,
    backgroundColor: P.surface,
    borderWidth: 1.5,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dpadBtnUp: {},
  dpadBtnDown: {},
  dpadBtnLeft: {},
  dpadBtnRight: {},
  dpadCenterPivot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: P.surfaceAlt,
    borderWidth: 1,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadCenterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: P.navyMuted,
  },
  dpadBtnSuccess: {
    borderColor: P.sage,
    backgroundColor: P.sageMuted,
  },
  dpadBtnError: {
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
