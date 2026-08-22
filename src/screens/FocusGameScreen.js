/**
 * OVERLOAD FocusGameScreen
 * Premium Luxury Light Theme — Focus & Attention Training Interface
 * Supports Target Search and Visual Tracking with real-time responsive feedback,
 * smooth coordinate-based token movement, combo multipliers, and adaptive difficulty.
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
import { FocusEngine, FOCUS_MODES, SESSION_TYPES, getComboMultiplier } from '../games/focus';
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

const TOKEN_SIZE = 54;

export default function FocusGameScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const mode = route.params?.mode || FOCUS_MODES.TARGET_SEARCH;
  const sessionType = route.params?.sessionType || SESSION_TYPES.QUICK;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 8
      : Math.max(insets.top, 20) + 4;

  const [engine] = useState(() => new FocusEngine({ mode, sessionType }));
  const [currentTask, setCurrentTask] = useState(null);
  const [taskStartTime, setTaskStartTime] = useState(Date.now());

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [roundNumber, setRoundNumber] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Visual Tracking Phases: 'highlight' | 'moving' | 'query' | 'feedback'
  const [trackingPhase, setTrackingPhase] = useState('highlight');
  const [feedbackState, setFeedbackState] = useState(null); // 'correct' | 'incorrect' | 'timeout'
  const [selectedItem, setSelectedItem] = useState(null);

  const isEvaluatingRef = useRef(false);
  const deadlineTimerRef = useRef(null);
  const movementTimerRef = useRef(null);
  const timerProgressAnim = useRef(new Animated.Value(1)).current;

  // Arena Dimensions & Coordinates for Visual Tracking
  const arenaSize = Math.min(width - 48, 310);
  const centerCoord = arenaSize / 2;
  const radius = centerCoord - (TOKEN_SIZE / 2 + 10);

  // Precomputed slot coordinates on ring
  const getSlotCoord = useCallback((slotIndex, totalSlots = 8) => {
    const angle = (2 * Math.PI * slotIndex) / totalSlots - Math.PI / 2;
    return {
      x: centerCoord + radius * Math.cos(angle) - TOKEN_SIZE / 2,
      y: centerCoord + radius * Math.sin(angle) - TOKEN_SIZE / 2,
    };
  }, [centerCoord, radius]);

  // Animated position vectors for up to 8 objects
  const tokenAnimPositions = useRef(
    Array.from({ length: 8 }, () => new Animated.ValueXY({ x: 0, y: 0 }))
  ).current;

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
      if (deadlineTimerRef.current) clearTimeout(deadlineTimerRef.current);
      if (movementTimerRef.current) clearTimeout(movementTimerRef.current);
    };
  }, []);

  // Visual Tracking Movement Sequence Orchestrator
  const runTrackingSequence = useCallback((task) => {
    setTrackingPhase('highlight');
    setFeedbackState(null);
    setSelectedItem(null);
    isEvaluatingRef.current = false;

    const totalSlots = task.totalSlots || 8;
    const objCount = task.objectCount || 4;

    // 1. Initialize Animated.ValueXY to starting slot coordinates
    for (let i = 0; i < objCount; i++) {
      const slot = task.initialSlotMap[i];
      const coord = getSlotCoord(slot, totalSlots);
      tokenAnimPositions[i].setValue(coord);
    }

    // 2. Highlight phase ends after highlightDurationMs
    movementTimerRef.current = setTimeout(() => {
      setTrackingPhase('moving');

      // 3. Step-by-step movement animation
      const steps = task.swapSteps || [];
      let stepIdx = 0;

      const executeNextStep = () => {
        if (stepIdx >= steps.length) {
          // Movement complete -> Query phase
          setTrackingPhase('query');
          setTaskStartTime(Date.now());

          // Start decision deadline
          timerProgressAnim.setValue(1);
          Animated.timing(timerProgressAnim, {
            toValue: 0,
            duration: task.responseDeadlineMs,
            useNativeDriver: false,
          }).start();

          deadlineTimerRef.current = setTimeout(() => {
            if (!isEvaluatingRef.current) {
              handleTimeout(task);
            }
          }, task.responseDeadlineMs);
          return;
        }

        const step = steps[stepIdx];
        const [objA, objB] = step.swappedObjects;
        const targetCoordA = getSlotCoord(step.slotMap[objA], totalSlots);
        const targetCoordB = getSlotCoord(step.slotMap[objB], totalSlots);

        Animated.parallel([
          Animated.timing(tokenAnimPositions[objA], {
            toValue: targetCoordA,
            duration: task.stepDurationMs,
            useNativeDriver: false,
          }),
          Animated.timing(tokenAnimPositions[objB], {
            toValue: targetCoordB,
            duration: task.stepDurationMs,
            useNativeDriver: false,
          }),
        ]).start(() => {
          stepIdx += 1;
          executeNextStep();
        });
      };

      executeNextStep();
    }, task.highlightDurationMs || 1400);
  }, [getSlotCoord, tokenAnimPositions, timerProgressAnim]);

  // Load next task
  const loadNextTask = useCallback(() => {
    if (deadlineTimerRef.current) clearTimeout(deadlineTimerRef.current);
    if (movementTimerRef.current) clearTimeout(movementTimerRef.current);

    const task = engine.startNextTask();
    setCurrentTask(task);
    setRoundNumber(engine.roundNumber);
    setLevel(engine.currentLevel);
    setFeedbackState(null);
    setSelectedItem(null);
    isEvaluatingRef.current = false;

    if (task.mode === FOCUS_MODES.VISUAL_TRACKING) {
      runTrackingSequence(task);
    } else {
      // ── Target Search Mode ──
      setTaskStartTime(Date.now());
      timerProgressAnim.setValue(1);
      Animated.timing(timerProgressAnim, {
        toValue: 0,
        duration: task.responseDeadlineMs,
        useNativeDriver: false,
      }).start();

      deadlineTimerRef.current = setTimeout(() => {
        if (!isEvaluatingRef.current && !isPaused) {
          handleTimeout(task);
        }
      }, task.responseDeadlineMs);
    }
  }, [engine, isPaused, runTrackingSequence, timerProgressAnim]);

  useEffect(() => {
    loadNextTask();
  }, []);

  // Handle Response Timeout
  const handleTimeout = (task) => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;

    triggerHaptic('warning');
    setFeedbackState('timeout');

    const result = engine.submitResponse(null, task.responseDeadlineMs);
    setScore(result.totalScore);
    setCombo(result.currentCombo);

    if (result.isSessionFinished) {
      setTimeout(() => {
        navigateToResults();
      }, 700);
    } else {
      setTimeout(() => {
        loadNextTask();
      }, 700);
    }
  };

  // Handle User Input
  const handleUserResponse = (userResponse) => {
    if (isEvaluatingRef.current || isPaused || !currentTask) return;
    if (currentTask.mode === FOCUS_MODES.VISUAL_TRACKING && trackingPhase !== 'query') return;

    isEvaluatingRef.current = true;

    if (deadlineTimerRef.current) clearTimeout(deadlineTimerRef.current);
    timerProgressAnim.stopAnimation();

    const responseTimeMs = Date.now() - taskStartTime;
    const result = engine.submitResponse(userResponse, responseTimeMs);

    setScore(result.totalScore);
    setCombo(result.currentCombo);
    setLevel(engine.currentLevel);
    setSelectedItem(userResponse);

    if (result.evaluation.isCorrect) {
      triggerHaptic('light');
      setFeedbackState('correct');
    } else {
      triggerHaptic('error');
      setFeedbackState('incorrect');
    }

    if (result.isSessionFinished) {
      setTimeout(() => {
        navigateToResults();
      }, 750);
    } else {
      setTimeout(() => {
        loadNextTask();
      }, result.evaluation.isCorrect ? 450 : 750);
    }
  };

  const navigateToResults = () => {
    const summary = engine.getSessionSummary();
    navigation.replace(ROUTES.RESULTS, {
      summary: {
        gameType: 'focus',
        facultyId: 'focus',
        mode: currentTask?.mode || mode,
        totalRounds: summary.totalRounds,
        averageAccuracy: summary.averageAccuracy,
        averageResponseTimeMs: summary.averageResponseTimeMs,
        score: summary.totalScore,
        bestCombo: summary.bestCombo,
        correctCount: summary.correctCount,
        incorrectCount: summary.incorrectCount,
        missedCount: summary.missedCount,
        falsePositiveCount: summary.falsePositiveCount,
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
          loadNextTask();
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
        onPress: () => {
          navigateToResults();
        },
      },
    ]);
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const comboMultiplier = getComboMultiplier(combo);
  const isVisualTracking = mode === FOCUS_MODES.VISUAL_TRACKING;
  const maxGridWidth = Math.min(width - 48, 330);

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
                {isVisualTracking ? 'VISUAL TRACKING' : 'TARGET SEARCH'} · ROUND {roundNumber}
              </Text>
              <Text style={styles.headerTitle}>Focus & Attention</Text>
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

          {/* Deadline Countdown Progress Line */}
          <View style={styles.deadlineTrack}>
            <Animated.View
              style={[
                styles.deadlineFill,
                {
                  width: timerProgressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor:
                    feedbackState === 'correct'
                      ? P.sage
                      : feedbackState === 'incorrect'
                      ? P.rose
                      : P.navy,
                },
              ]}
            />
          </View>
        </View>

        {/* ── CENTER INTERACTIVE PLAY AREA ── */}
        <View style={styles.centerSection}>
          {currentTask && !isVisualTracking && (
            /* ── MODE A: TARGET SEARCH ── */
            <>
              <View style={styles.targetInstructionCard}>
                <View style={styles.targetInstructionLeft}>
                  <Text style={styles.targetLabel}>CURRENT TARGET</Text>
                  <Text style={styles.targetTitle}>{currentTask.target.instructionText}</Text>
                  <Text style={styles.targetSub}>{currentTask.target.instructionSubtext}</Text>
                </View>
                <View
                  style={[
                    styles.targetVisualPreview,
                    { borderColor: `${currentTask.target.color}35` },
                  ]}
                >
                  <Text style={[styles.targetShapeText, { color: currentTask.target.color }]}>
                    {currentTask.target.shape}
                  </Text>
                </View>
              </View>

              {/* Dynamic Grid */}
              <View
                style={[
                  styles.stimuliGrid,
                  {
                    width: maxGridWidth,
                    height: maxGridWidth,
                  },
                ]}
              >
                {currentTask.stimuli.map((item, index) => {
                  const cols = currentTask.gridCols || 3;
                  const itemDimension = Math.floor((maxGridWidth - (cols - 1) * 10) / cols);

                  const isThisSelected = selectedItem === index;
                  const isFeedbackCorrect = feedbackState === 'correct' && isThisSelected;
                  const isFeedbackIncorrect = feedbackState === 'incorrect' && isThisSelected;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.78}
                      disabled={isPaused || isEvaluatingRef.current}
                      onPress={() => handleUserResponse(index)}
                      style={[
                        styles.stimulusCell,
                        {
                          width: itemDimension,
                          height: itemDimension,
                          borderColor: isFeedbackCorrect
                            ? P.sage
                            : isFeedbackIncorrect
                            ? P.rose
                            : P.border,
                          backgroundColor: isFeedbackCorrect
                            ? P.sageMuted
                            : isFeedbackIncorrect
                            ? P.roseMuted
                            : P.surface,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.colorName} ${item.shape}`}
                    >
                      <Text style={[styles.stimulusShape, { color: item.color }]}>
                        {item.shape}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {currentTask && isVisualTracking && (
            /* ── MODE B: VISUAL TRACKING ── */
            <View style={styles.trackingContainer}>
              <View style={styles.trackingPromptCard}>
                <Text style={styles.trackingInstruction}>
                  {trackingPhase === 'highlight'
                    ? 'FOCUS ON TARGET'
                    : trackingPhase === 'moving'
                    ? 'TRACK THE TARGET'
                    : trackingPhase === 'query'
                    ? 'WHERE IS THE TARGET?'
                    : feedbackState === 'correct'
                    ? 'TARGET ACQUIRED'
                    : 'INCORRECT LOCATION'}
                </Text>
                <Text style={styles.trackingSub}>
                  {trackingPhase === 'highlight'
                    ? 'Observe the highlighted token before movement begins'
                    : trackingPhase === 'moving'
                    ? 'Follow its path as tokens swap positions'
                    : 'Tap the token where the target ended'}
                </Text>
              </View>

              {/* Arena Field with Animated Tokens */}
              <View
                style={[
                  styles.trackingArena,
                  { width: arenaSize, height: arenaSize },
                ]}
              >
                {/* Subtle arena background guide ring */}
                <View
                  style={[
                    styles.arenaGuideRing,
                    {
                      width: radius * 2 + TOKEN_SIZE,
                      height: radius * 2 + TOKEN_SIZE,
                      borderRadius: (radius * 2 + TOKEN_SIZE) / 2,
                    },
                  ]}
                />

                {Array.from({ length: currentTask.objectCount || 4 }).map((_, objIdx) => {
                  const isTargetObj = objIdx === currentTask.targetId;
                  const isHighlighted = trackingPhase === 'highlight' && isTargetObj;
                  const isSelected = selectedItem === objIdx;

                  // In feedback phase: show correct vs incorrect
                  const isCorrectTarget = isTargetObj;
                  const showSuccess = feedbackState === 'correct' && isSelected;
                  const showError = feedbackState === 'incorrect' && isSelected;
                  const showReveal = feedbackState === 'incorrect' && isCorrectTarget;

                  return (
                    <Animated.View
                      key={objIdx}
                      style={[
                        styles.trackingTokenWrapper,
                        {
                          transform: tokenAnimPositions[objIdx].getTranslateTransform(),
                        },
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.82}
                        disabled={isPaused || trackingPhase !== 'query' || isEvaluatingRef.current}
                        onPress={() => handleUserResponse(objIdx)}
                        style={[
                          styles.trackingToken,
                          isHighlighted && styles.tokenHighlighted,
                          showSuccess && styles.tokenSuccess,
                          showError && styles.tokenError,
                          showReveal && styles.tokenReveal,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Token ${objIdx + 1}`}
                      >
                        {isHighlighted ? (
                          <View style={styles.targetInnerBadge}>
                            <Ionicons name="scan" size={24} color={P.gold} />
                          </View>
                        ) : showSuccess ? (
                          <Ionicons name="checkmark" size={24} color={P.sage} />
                        ) : showError ? (
                          <Ionicons name="close" size={24} color={P.rose} />
                        ) : showReveal ? (
                          <Ionicons name="checkmark" size={24} color={P.sage} />
                        ) : (
                          <View style={styles.neutralTokenDot} />
                        )}
                      </TouchableOpacity>
                    </Animated.View>
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

  /* ── Deadline Bar ── */
  deadlineTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: P.surfaceAlt,
    overflow: 'hidden',
    marginTop: 10,
  },
  deadlineFill: {
    height: '100%',
    borderRadius: 2,
  },

  /* ── Center Section ── */
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  /* ── Target Search UI ── */
  targetInstructionCard: {
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
  targetInstructionLeft: {
    flex: 1,
  },
  targetLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  targetTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
  },
  targetSub: {
    fontSize: 12,
    color: P.textSec,
    marginTop: 2,
  },
  targetVisualPreview: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
    backgroundColor: P.surfaceAlt,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  targetShapeText: {
    fontSize: 26,
    fontWeight: typography.weights.bold,
  },

  /* ── Stimuli Grid ── */
  stimuliGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  stimulusCell: {
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
  stimulusShape: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
  },

  /* ── Visual Tracking UI ── */
  trackingContainer: {
    width: '100%',
    alignItems: 'center',
  },
  trackingPromptCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  trackingInstruction: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: P.text,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  trackingSub: {
    fontSize: 13,
    color: P.textSec,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  trackingArena: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  arenaGuideRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: P.border,
    borderStyle: 'dashed',
  },
  trackingTokenWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: TOKEN_SIZE,
    height: TOKEN_SIZE,
  },
  trackingToken: {
    width: TOKEN_SIZE,
    height: TOKEN_SIZE,
    borderRadius: TOKEN_SIZE / 2,
    backgroundColor: P.surface,
    borderWidth: 2,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tokenHighlighted: {
    borderColor: P.gold,
    backgroundColor: P.goldMuted,
    borderWidth: 2.5,
  },
  tokenSuccess: {
    borderColor: P.sage,
    backgroundColor: P.sageMuted,
    borderWidth: 2.5,
  },
  tokenError: {
    borderColor: P.rose,
    backgroundColor: P.roseMuted,
    borderWidth: 2.5,
  },
  tokenReveal: {
    borderColor: P.sage,
    backgroundColor: P.sageMuted,
    borderWidth: 2.5,
  },
  targetInnerBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  neutralTokenDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: P.navy,
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
