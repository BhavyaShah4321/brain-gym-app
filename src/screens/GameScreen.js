/**
 * OVERLOAD GameScreen
 * Premium Luxury Light Theme — Complete Working Memory Faculty Interface
 * Supports 4 distinct cognitive memory games:
 * 1. Sequence Recall (Serial spatial paths)
 * 2. Grid Memory (Simultaneous matrix retention)
 * 3. Object Recall (Visual feature & symbol recognition)
 * 4. Order Recall (Temporal sequence reconstruction)
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
import { MemoryEngine, MEMORY_MODES, MEMORY_MODE_DETAILS, getMemoryComboMultiplier } from '../games/memory';
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
  goldMuted: 'rgba(197, 165, 90, 0.10)',
  goldBorder: 'rgba(197, 165, 90, 0.35)',

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

export default function GameScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const mode = route.params?.mode || MEMORY_MODES.SEQUENCE_RECALL;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 8
      : Math.max(insets.top, 20) + 4;

  const [engine] = useState(() => new MemoryEngine({ mode, initialSpan: 3 }));
  const [currentTask, setCurrentTask] = useState(null);

  // Phases: 'memorize' | 'recall' | 'feedback'
  const [phase, setPhase] = useState('memorize');
  const [userInputs, setUserInputs] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [errorCell, setErrorCell] = useState(null);

  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [span, setSpan] = useState(3);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isEvaluatingRef = useRef(false);
  const memorizeTimerRef = useRef(null);
  const countdownAnim = useRef(new Animated.Value(1)).current;

  // Grid / Board sizing
  const gridWidth = Math.min(width - 48, 300);
  const gridCols = currentTask?.gridCols || 3;
  const cellSize = Math.floor((gridWidth - (gridCols - 1) * 8) / gridCols);

  const cellScaleAnims = useRef(
    Array.from({ length: 16 }, () => new Animated.Value(1))
  ).current;

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
      if (memorizeTimerRef.current) clearTimeout(memorizeTimerRef.current);
    };
  }, []);

  // Start next round
  const startNextRound = useCallback((spanVal = engine.currentSpan) => {
    if (memorizeTimerRef.current) clearTimeout(memorizeTimerRef.current);

    const task = engine.startNextTask();
    setCurrentTask(task);
    setUserInputs([]);
    setPhase('memorize');
    setActiveCell(null);
    setErrorCell(null);
    setSpan(spanVal);
    setRoundNumber(engine.roundNumber);
    isEvaluatingRef.current = false;

    // ── GAME 1: SEQUENCE RECALL (Serial playback) ──
    if (task.mode === MEMORY_MODES.SEQUENCE_RECALL) {
      const seq = task.sequence || [];
      seq.forEach((cellIdx, i) => {
        setTimeout(() => {
          setActiveCell(cellIdx);
          triggerHaptic('light');
          Animated.sequence([
            Animated.timing(cellScaleAnims[cellIdx], {
              toValue: 1.06,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.timing(cellScaleAnims[cellIdx], {
              toValue: 1,
              duration: 120,
              useNativeDriver: true,
            }),
          ]).start();
        }, (i + 1) * 650);

        setTimeout(() => {
          setActiveCell(null);
          if (i === seq.length - 1) {
            setPhase('recall');
            setRoundStartTime(Date.now());
            triggerHaptic('selection');
          }
        }, (i + 1) * 650 + 380);
      });
      return;
    }

    // ── GAMES 2, 3, 4: SIMULTANEOUS MEMORIZATION WITH COUNTDOWN ──
    const displayDuration = task.displayDurationMs || 1500;
    countdownAnim.setValue(1);
    Animated.timing(countdownAnim, {
      toValue: 0,
      duration: displayDuration,
      useNativeDriver: false,
    }).start();

    memorizeTimerRef.current = setTimeout(() => {
      setPhase('recall');
      setRoundStartTime(Date.now());
      triggerHaptic('selection');
    }, displayDuration);
  }, [engine, cellScaleAnims, countdownAnim]);

  useEffect(() => {
    startNextRound();
  }, []);

  // ── SUBMIT EVALUATION ──
  const finalizeRound = (finalInputs) => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;

    const responseTime = Date.now() - roundStartTime;
    const result = engine.submitResponse(finalInputs, responseTime);

    setStreak(engine.streak);
    setScore(engine.totalScore);
    setPhase('feedback');

    if (result.evaluation.isPerfect) {
      triggerHaptic('success');
      setTimeout(() => {
        if (result.isSessionFinished) {
          navigateToResults();
        } else {
          startNextRound(result.nextDifficulty.nextSpan);
        }
      }, 650);
    } else {
      triggerHaptic('error');
      setTimeout(() => {
        if (result.isSessionFinished) {
          navigateToResults();
        } else {
          startNextRound(result.nextDifficulty.nextSpan);
        }
      }, 850);
    }
  };

  // ── GAME 1: SEQUENCE RECALL TOUCH HANDLER ──
  const handleSequenceCellPress = (index) => {
    if (phase !== 'recall' || isPaused || isEvaluatingRef.current) return;

    triggerHaptic('light');
    const nextInputs = [...userInputs, index];
    setUserInputs(nextInputs);

    Animated.sequence([
      Animated.timing(cellScaleAnims[index], {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(cellScaleAnims[index], {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    if (nextInputs.length === (currentTask?.sequence?.length || span)) {
      finalizeRound(nextInputs);
    }
  };

  // ── GAME 2: GRID MEMORY TOUCH HANDLER ──
  const handleGridCellPress = (index) => {
    if (phase !== 'recall' || isPaused || isEvaluatingRef.current) return;

    triggerHaptic('light');
    const nextInputs = userInputs.includes(index)
      ? userInputs.filter((i) => i !== index)
      : [...userInputs, index];

    setUserInputs(nextInputs);

    if (nextInputs.length === (currentTask?.targetCount || currentTask?.targetCells?.length || span)) {
      finalizeRound(nextInputs);
    }
  };

  // ── GAME 3: OBJECT RECALL TOUCH HANDLER ──
  const handleObjectChoicePress = (objectId) => {
    if (phase !== 'recall' || isPaused || isEvaluatingRef.current) return;

    triggerHaptic('light');
    const nextInputs = userInputs.includes(objectId)
      ? userInputs.filter((id) => id !== objectId)
      : [...userInputs, objectId];

    setUserInputs(nextInputs);

    if (nextInputs.length === (currentTask?.targetCount || span)) {
      finalizeRound(nextInputs);
    }
  };

  // ── GAME 4: ORDER RECALL TOUCH HANDLERS ──
  const handleOrderPoolItemPress = (item) => {
    if (phase !== 'recall' || isPaused || isEvaluatingRef.current) return;

    const alreadyPlaced = userInputs.some((placed) => placed.id === item.id);
    if (alreadyPlaced) return;

    triggerHaptic('light');
    const nextInputs = [...userInputs, item];
    setUserInputs(nextInputs);

    if (nextInputs.length === (currentTask?.itemCount || currentTask?.orderedItems?.length || span)) {
      finalizeRound(nextInputs);
    }
  };

  const handleOrderSlotUndo = (index) => {
    if (phase !== 'recall' || isPaused || isEvaluatingRef.current) return;

    triggerHaptic('selection');
    const nextInputs = userInputs.filter((_, i) => i !== index);
    setUserInputs(nextInputs);
  };

  const navigateToResults = () => {
    const summary = engine.getSessionSummary();
    navigation.replace(ROUTES.RESULTS, {
      summary: {
        gameType: 'memory',
        facultyId: 'memory',
        mode: currentTask?.mode || mode,
        totalRounds: summary.totalRounds,
        averageAccuracy: summary.averageAccuracy,
        averageResponseTimeMs: summary.averageResponseTimeMs,
        currentSpan: summary.currentSpan,
        peakSpan: summary.peakSpan,
        bestCombo: summary.bestCombo,
        score: summary.totalScore,
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
          setStreak(0);
          setScore(0);
          setElapsedSeconds(0);
          engine.roundNumber = 0;
          engine.totalScore = 0;
          engine.streak = 0;
          engine.sessionHistory = [];
          startNextRound(3);
        },
      },
    ]);
  };

  const handleGiveUp = () => {
    triggerHaptic('warning');
    Alert.alert('End Drill', 'Return to dashboard and save progress?', [
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

  const modeDetails = MEMORY_MODE_DETAILS[mode] || MEMORY_MODE_DETAILS[MEMORY_MODES.SEQUENCE_RECALL];
  const comboMultiplier = getMemoryComboMultiplier(streak);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} translucent />

      <View style={[styles.container, { paddingTop: topPad }]}>
        {/* ── TOP BAR ── */}
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
              <Text style={styles.headerTitle}>Working Memory</Text>
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

          {/* ── HUD ROW ── */}
          <LinearGradient
            colors={['#F5F2ED', '#EDE9E1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.hudRow}
          >
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Span</Text>
              <Text style={styles.hudValue}>{span} items</Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Streak</Text>
              <Text style={[styles.hudValue, { color: streak >= 2 ? P.gold : P.text }]}>
                {streak}x {comboMultiplier > 1 ? `(${comboMultiplier}x)` : ''}
              </Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Score</Text>
              <Text style={styles.hudValue}>{score}</Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>Time</Text>
              <Text style={styles.hudValue}>{formatTimer(elapsedSeconds)}</Text>
            </View>
          </LinearGradient>

          {/* Countdown Progress Bar for Memorize phase */}
          {phase === 'memorize' && mode !== MEMORY_MODES.SEQUENCE_RECALL && (
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
          )}
        </View>

        {/* ── CENTER SECTION ── */}
        <View style={styles.centerSection}>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionPrimary}>
              {isPaused
                ? 'Session Paused'
                : phase === 'memorize'
                ? modeDetails.instruction
                : phase === 'recall'
                ? modeDetails.recallInstruction
                : 'Evaluating...'}
            </Text>
            <Text style={styles.instructionSecondary}>
              {phase === 'recall'
                ? `Selected ${userInputs.length} of ${
                    mode === MEMORY_MODES.SEQUENCE_RECALL
                      ? currentTask?.sequence?.length || span
                      : mode === MEMORY_MODES.GRID_MEMORY
                      ? currentTask?.targetCount || span
                      : mode === MEMORY_MODES.OBJECT_RECALL
                      ? currentTask?.targetCount || span
                      : currentTask?.itemCount || span
                  }`
                : 'Focus and memorize the visual pattern'}
            </Text>
          </View>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* GAME 1: SEQUENCE RECALL (Serial Path)                         */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === MEMORY_MODES.SEQUENCE_RECALL && (
            <View style={[styles.grid, { width: gridWidth, height: gridWidth }]}>
              {Array.from({ length: 9 }).map((_, index) => {
                const isIlluminated = activeCell === index;
                const isSelected = userInputs.includes(index);
                const isError = errorCell === index;

                return (
                  <Animated.View
                    key={index}
                    style={{ transform: [{ scale: cellScaleAnims[index] }] }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={phase !== 'recall' || isPaused}
                      onPress={() => handleSequenceCellPress(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`Cell ${index + 1}`}
                      style={[
                        styles.cell,
                        { width: cellSize, height: cellSize },
                        isIlluminated && styles.cellIlluminated,
                        isSelected && styles.cellSelected,
                        isError && styles.cellError,
                      ]}
                    >
                      <View
                        style={[
                          styles.cellDot,
                          isIlluminated && styles.cellDotActive,
                          isSelected && styles.cellDotSelected,
                        ]}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* GAME 2: GRID MEMORY (Simultaneous Spatial Matrix)              */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === MEMORY_MODES.GRID_MEMORY && currentTask && (
            <View style={[styles.grid, { width: gridWidth, height: gridWidth }]}>
              {Array.from({ length: currentTask.gridSize || 9 }).map((_, index) => {
                const isTarget = currentTask.targetCells?.includes(index);
                const isIlluminated = phase === 'memorize' && isTarget;
                const isSelected = userInputs.includes(index);

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    disabled={phase !== 'recall' || isPaused}
                    onPress={() => handleGridCellPress(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Grid Cell ${index + 1}`}
                    style={[
                      styles.cell,
                      { width: cellSize, height: cellSize },
                      isIlluminated && styles.cellIlluminated,
                      isSelected && styles.cellSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.cellDot,
                        isIlluminated && styles.cellDotActive,
                        isSelected && styles.cellDotSelected,
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* GAME 3: OBJECT RECALL (Visual Feature Recognition)             */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === MEMORY_MODES.OBJECT_RECALL && currentTask && (
            <View style={styles.objectRecallContainer}>
              {phase === 'memorize' ? (
                /* Memorize Tray */
                <View style={styles.objectMemorizeGrid}>
                  {currentTask.targetObjects?.map((obj) => (
                    <View
                      key={obj.id}
                      style={[styles.objectCard, { borderColor: `${obj.color}40` }]}
                    >
                      <Text style={[styles.objectShapeText, { color: obj.color }]}>
                        {obj.shape}
                      </Text>
                      <Text style={styles.objectNameText}>{obj.name}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                /* Recall Choice Tray */
                <View style={styles.objectRecallGrid}>
                  {currentTask.allChoices?.map((obj) => {
                    const isSelected = userInputs.includes(obj.id);
                    return (
                      <TouchableOpacity
                        key={obj.id}
                        activeOpacity={0.8}
                        disabled={phase !== 'recall' || isPaused}
                        onPress={() => handleObjectChoicePress(obj.id)}
                        style={[
                          styles.objectCard,
                          isSelected && styles.objectCardSelected,
                        ]}
                      >
                        <Text style={[styles.objectShapeText, { color: obj.color }]}>
                          {obj.shape}
                        </Text>
                        <Text style={styles.objectNameText}>{obj.name}</Text>
                        {isSelected && (
                          <View style={styles.objectSelectedBadge}>
                            <Ionicons name="checkmark" size={14} color={P.textInverse} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* GAME 4: ORDER RECALL (Temporal Sequence Reconstruction)       */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {mode === MEMORY_MODES.ORDER_RECALL && currentTask && (
            <View style={styles.orderRecallContainer}>
              {phase === 'memorize' ? (
                /* Memorize Banner */
                <View style={styles.orderMemorizeRow}>
                  {currentTask.orderedItems?.map((item, idx) => (
                    <View key={item.id} style={styles.orderMemorizeItemWrapper}>
                      <View style={styles.orderIndexBadge}>
                        <Text style={styles.orderIndexText}>{idx + 1}</Text>
                      </View>
                      <View style={styles.orderItemCard}>
                        <Text style={[styles.orderItemShape, { color: item.color }]}>
                          {item.shape}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                /* Recall Reconstruct Area */
                <View style={styles.orderRecallArea}>
                  {/* Slots Above */}
                  <Text style={styles.orderSectionLabel}>RECONSTRUCTED SEQUENCE</Text>
                  <View style={styles.orderSlotsRow}>
                    {Array.from({ length: currentTask.itemCount || span }).map((_, slotIdx) => {
                      const placedItem = userInputs[slotIdx];
                      return (
                        <TouchableOpacity
                          key={slotIdx}
                          activeOpacity={0.7}
                          disabled={!placedItem || phase !== 'recall' || isPaused}
                          onPress={() => handleOrderSlotUndo(slotIdx)}
                          style={[
                            styles.orderSlot,
                            placedItem && styles.orderSlotFilled,
                          ]}
                        >
                          {placedItem ? (
                            <Text style={[styles.orderItemShape, { color: placedItem.color }]}>
                              {placedItem.shape}
                            </Text>
                          ) : (
                            <Text style={styles.orderSlotNumber}>{slotIdx + 1}</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Shuffled Choice Pool Below */}
                  <Text style={styles.orderSectionLabel}>AVAILABLE ITEMS</Text>
                  <View style={styles.orderPoolRow}>
                    {currentTask.shuffledPool?.map((item) => {
                      const isPlaced = userInputs.some((placed) => placed.id === item.id);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.8}
                          disabled={isPlaced || phase !== 'recall' || isPaused}
                          onPress={() => handleOrderPoolItemPress(item)}
                          style={[
                            styles.orderPoolCard,
                            isPlaced && styles.orderPoolCardPlaced,
                          ]}
                        >
                          <Text
                            style={[
                              styles.orderItemShape,
                              { color: isPlaced ? P.textMuted : item.color },
                            ]}
                          >
                            {item.shape}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
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
  instructionBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  instructionPrimary: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: P.text,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 4,
  },
  instructionSecondary: {
    fontSize: 13,
    color: P.textSec,
    textAlign: 'center',
  },

  /* ── Common Grid ── */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  cell: {
    backgroundColor: P.surface,
    borderRadius: radii.md,
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
  cellIlluminated: {
    backgroundColor: P.navy,
    borderColor: P.navy,
  },
  cellSelected: {
    backgroundColor: P.navyMuted,
    borderColor: P.navy,
    borderWidth: 2,
  },
  cellError: {
    backgroundColor: P.danger,
    borderColor: P.danger,
  },
  cellDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: P.border,
  },
  cellDotActive: {
    backgroundColor: P.textInverse,
  },
  cellDotSelected: {
    backgroundColor: P.navy,
  },

  /* ── Object Recall UI ── */
  objectRecallContainer: {
    width: '100%',
    alignItems: 'center',
  },
  objectMemorizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 12,
  },
  objectRecallGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 12,
  },
  objectCard: {
    width: 78,
    height: 84,
    borderRadius: radii.card,
    backgroundColor: P.surface,
    borderWidth: 1.5,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  objectCardSelected: {
    borderColor: P.navy,
    backgroundColor: P.navyMuted,
    borderWidth: 2,
  },
  objectShapeText: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  objectNameText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: P.textSec,
  },
  objectSelectedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: P.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Order Recall UI ── */
  orderRecallContainer: {
    width: '100%',
    alignItems: 'center',
  },
  orderMemorizeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  orderMemorizeItemWrapper: {
    alignItems: 'center',
  },
  orderIndexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: P.navyMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderIndexText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.navy,
  },
  orderItemCard: {
    width: 58,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: P.surface,
    borderWidth: 1.5,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderItemShape: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
  },
  orderRecallArea: {
    width: '100%',
    alignItems: 'center',
  },
  orderSectionLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 6,
  },
  orderSlotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  orderSlot: {
    width: 54,
    height: 60,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: P.border,
    borderStyle: 'dashed',
    backgroundColor: P.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderSlotFilled: {
    borderStyle: 'solid',
    borderColor: P.navy,
    backgroundColor: P.surface,
  },
  orderSlotNumber: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: P.textMuted,
  },
  orderPoolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  orderPoolCard: {
    width: 56,
    height: 62,
    borderRadius: radii.md,
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
  orderPoolCardPlaced: {
    opacity: 0.35,
    borderColor: P.border,
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
