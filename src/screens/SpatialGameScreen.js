/**
 * OVERLOAD SpatialGameScreen
 * Premium Luxury Light Theme — Spatial Reasoning & Real-Time Navigation
 * Supports 3 distinct spatial games:
 * 1. Mental Rotation (Mental 2D rotation of geometric figures)
 * 2. Spatial Navigation (Real-time path planning through grid labyrinths)
 * 3. Mirror Map (Coordinate reflection & spatial layout transformations)
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
  SpatialEngine,
  SPATIAL_MODES,
  SPATIAL_MODE_DETAILS,
  SESSION_TYPES,
  getSpatialComboMultiplier,
} from '../games/spatial';
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

  obstacle: '#334155',
  player: '#0284C7',
  target: '#C5A55A',
  danger: '#C4787A',
};

// Shape grid block rendering helper for Mental Rotation
function renderShapeGrid(matrix, blockSize = 24, activeColor = P.navy) {
  return (
    <View style={styles.shapeGridContainer}>
      {matrix.map((row, rIdx) => (
        <View key={`row_${rIdx}`} style={styles.shapeGridRow}>
          {row.map((val, cIdx) => (
            <View
              key={`cell_${rIdx}_${cIdx}`}
              style={[
                styles.shapeGridCell,
                {
                  width: blockSize,
                  height: blockSize,
                  backgroundColor: val === 1 ? activeColor : 'transparent',
                  borderColor: val === 1 ? activeColor : P.border,
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function SpatialGameScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const mode = route.params?.mode || SPATIAL_MODES.MENTAL_ROTATION;
  const sessionType = route.params?.sessionType || SESSION_TYPES.QUICK;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 8
      : Math.max(insets.top, 20) + 4;

  const [engine] = useState(() => new SpatialEngine({ mode, sessionType }));
  const [currentTask, setCurrentTask] = useState(null);

  // States: 'active' | 'feedback'
  const [roundPhase, setRoundPhase] = useState('active');
  const [feedbackData, setFeedbackData] = useState(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);

  // Spatial Navigation real-time state
  const [playerPath, setPlayerPath] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);

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

    if (task.mode === SPATIAL_MODES.SPATIAL_NAVIGATION) {
      setPlayerPath([task.start.index]);
      setCurrentPos(task.start);
    }

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
      subtext: 'Navigation window exceeded',
    });

    if (result.isSessionFinished) {
      setTimeout(() => navigateToResults(), 800);
    } else {
      setTimeout(() => loadNextRound(), 750);
    }
  };

  // Real-time Navigation Tap Handler
  const handleNavCellTap = (targetRow, targetCol) => {
    if (isEvaluatingRef.current || isPaused || !currentTask || roundPhase !== 'active' || !currentPos) return;

    const gridSize = currentTask.gridSize;
    const targetIdx = targetRow * gridSize + targetCol;

    // Check if cell is an obstacle
    const isObstacle = currentTask.obstacles?.some((o) => o.index === targetIdx);
    if (isObstacle) {
      triggerHaptic('warning');
      return;
    }

    // Check if move is adjacent (Manhattan distance === 1)
    const dr = Math.abs(targetRow - currentPos.row);
    const dc = Math.abs(targetCol - currentPos.col);
    if (dr + dc !== 1) {
      // Non-adjacent move rejected
      triggerHaptic('light');
      return;
    }

    // Valid step
    triggerHaptic('light');
    const nextPath = [...playerPath, targetIdx];
    setPlayerPath(nextPath);
    setCurrentPos({ row: targetRow, col: targetCol, index: targetIdx });

    // Check if reached target
    if (targetIdx === currentTask.target.index) {
      isEvaluatingRef.current = true;
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      countdownAnim.stopAnimation();

      const responseTimeMs = Date.now() - roundStartTimeRef.current;
      const result = engine.submitResponse(nextPath, responseTimeMs);

      setScore(result.totalScore);
      setCombo(result.currentCombo);
      setLevel(engine.currentLevel);
      setRoundPhase('feedback');
      triggerHaptic('success');

      setFeedbackData({
        isCorrect: true,
        text: 'TARGET REACHED',
        subtext: `${result.evaluation.routeEfficiency}% Route Efficiency · ${result.evaluation.movesCount} moves`,
      });

      if (result.isSessionFinished) {
        setTimeout(() => navigateToResults(), 900);
      } else {
        setTimeout(() => loadNextRound(), 800);
      }
    }
  };

  // Submit User Spatial Choice (Mental Rotation / Mirror Map)
  const handleSelectChoice = (choicePayload) => {
    if (isEvaluatingRef.current || isPaused || !currentTask || roundPhase !== 'active') return;

    isEvaluatingRef.current = true;
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    countdownAnim.stopAnimation();

    const responseTimeMs = Date.now() - roundStartTimeRef.current;
    const result = engine.submitResponse(choicePayload, responseTimeMs);

    setScore(result.totalScore);
    setCombo(result.currentCombo);
    setLevel(engine.currentLevel);
    setSelectedChoiceId(choicePayload);
    setRoundPhase('feedback');

    if (result.evaluation.isCorrect) {
      triggerHaptic('success');
      setFeedbackData({
        isCorrect: true,
        text: result.evaluation.feedbackMessage || 'CORRECT TRANSFORMATION',
        subtext: `${Math.round(responseTimeMs)} ms · High Precision`,
      });
    } else {
      triggerHaptic('error');
      setFeedbackData({
        isCorrect: false,
        text: result.evaluation.feedbackMessage || 'INCORRECT TRANSFORMATION',
        subtext: 'Verify orientation and symmetry axes',
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
        gameType: 'spatial',
        facultyId: 'spatial',
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

  const modeDetails = SPATIAL_MODE_DETAILS[mode] || SPATIAL_MODE_DETAILS[SPATIAL_MODES.MENTAL_ROTATION];
  const comboMultiplier = getSpatialComboMultiplier(combo);
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
              <Text style={styles.headerTitle}>Spatial Reasoning</Text>
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

        {/* ── CENTER INTERACTIVE SPATIAL AREA ── */}
        <View style={styles.centerSection}>
          <ScrollView
            contentContainerStyle={styles.scrollCenter}
            showsVerticalScrollIndicator={false}
          >
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 1: MENTAL ROTATION                                        */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === SPATIAL_MODES.MENTAL_ROTATION && currentTask && (
              <View style={styles.gameContainer}>
                {/* Target Shape Card */}
                <View style={[styles.targetFigureCard, { width: arenaWidth }]}>
                  <Text style={styles.targetFigureLabel}>TARGET FIGURE</Text>
                  {renderShapeGrid(currentTask.targetMatrix, 22, P.navy)}
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
                      : feedbackData?.subtext || 'Processing orientation...'}
                  </Text>
                </View>

                {/* Candidate Rotation Options */}
                <View style={[styles.rotationCandidatesGrid, { width: arenaWidth }]}>
                  {currentTask.options?.map((opt) => {
                    const isSelected = selectedChoiceId === opt.id;
                    const isCorrect = currentTask.correctOptionId === opt.id;
                    const showFeedback = roundPhase === 'feedback';

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.82}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleSelectChoice(opt.id)}
                        style={[
                          styles.rotationCandidateCard,
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        <View style={styles.candidateLetterBadge}>
                          <Text style={styles.candidateLetterText}>{opt.letter}</Text>
                        </View>
                        {renderShapeGrid(
                          opt.matrix,
                          18,
                          showFeedback && isSelected
                            ? isCorrect
                              ? P.sage
                              : P.rose
                            : P.navyLight
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 2: SPATIAL NAVIGATION (REAL-TIME PATH PLANNING)           */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === SPATIAL_MODES.SPATIAL_NAVIGATION && currentTask && (
              <View style={styles.gameContainer}>
                <View style={styles.promptHeader}>
                  <Text style={styles.promptInstruction}>
                    {roundPhase === 'active'
                      ? `MOVES: ${playerPath.length - 1} · OPTIMAL: ${currentTask.optimalMoves}`
                      : feedbackData?.text || 'ROUTE COMPLETED'}
                  </Text>
                  <Text style={styles.promptSubtext}>
                    {roundPhase === 'active'
                      ? 'Tap adjacent cells to navigate from Start to Target'
                      : feedbackData?.subtext || 'Route efficiency calculated'}
                  </Text>
                </View>

                {/* Labyrinth Grid */}
                <View
                  style={[
                    styles.navigationLabyrinthGrid,
                    {
                      width: arenaWidth,
                      height: arenaWidth,
                    },
                  ]}
                >
                  {Array.from({ length: currentTask.gridSize * currentTask.gridSize }).map((_, cellIdx) => {
                    const r = Math.floor(cellIdx / currentTask.gridSize);
                    const c = cellIdx % currentTask.gridSize;

                    const isStart = currentTask.start.index === cellIdx;
                    const isTarget = currentTask.target.index === cellIdx;
                    const isObstacle = currentTask.obstacles?.some((o) => o.index === cellIdx);
                    const isCurrentPlayer = currentPos?.index === cellIdx;
                    const isInPath = playerPath.includes(cellIdx) && !isCurrentPlayer;

                    return (
                      <TouchableOpacity
                        key={`cell_${cellIdx}`}
                        activeOpacity={0.75}
                        disabled={isPaused || roundPhase !== 'active' || isObstacle}
                        onPress={() => handleNavCellTap(r, c)}
                        style={[
                          styles.navGridCell,
                          {
                            width: `${100 / currentTask.gridSize - 2}%`,
                            height: `${100 / currentTask.gridSize - 2}%`,
                            backgroundColor: isObstacle
                              ? P.obstacle
                              : isCurrentPlayer
                              ? P.player
                              : isTarget
                              ? P.goldMuted
                              : isStart
                              ? P.navyMuted
                              : isInPath
                              ? P.surfaceAlt
                              : P.surface,
                            borderColor: isCurrentPlayer
                              ? P.player
                              : isTarget
                              ? P.gold
                              : isObstacle
                              ? P.obstacle
                              : P.border,
                          },
                        ]}
                      >
                        {isCurrentPlayer ? (
                          <View style={styles.playerAvatarDot}>
                            <Ionicons name="navigate" size={16} color="#FFFFFF" />
                          </View>
                        ) : isTarget ? (
                          <Ionicons name="flag" size={18} color={P.gold} />
                        ) : isStart ? (
                          <Text style={styles.startBadgeText}>S</Text>
                        ) : isObstacle ? (
                          <Ionicons name="close" size={14} color="#64748B" />
                        ) : isInPath ? (
                          <View style={styles.pathCrumbDot} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 3: MIRROR MAP                                             */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === SPATIAL_MODES.MIRROR_MAP && currentTask && (
              <View style={styles.gameContainer}>
                {/* Original Source Map */}
                <View style={[styles.sourceMapCard, { width: arenaWidth }]}>
                  <Text style={styles.targetFigureLabel}>ORIGINAL LAYOUT</Text>
                  <View style={styles.miniMapGrid}>
                    {Array.from({ length: currentTask.gridSize * currentTask.gridSize }).map((_, idx) => {
                      const isTarget = currentTask.target.index === idx;
                      const isObstacle = currentTask.obstacles?.some((o) => o.index === idx);

                      return (
                        <View
                          key={`src_${idx}`}
                          style={[
                            styles.miniMapCell,
                            {
                              width: currentTask.gridSize === 3 ? 40 : 32,
                              height: currentTask.gridSize === 3 ? 40 : 32,
                              backgroundColor: isTarget ? P.gold : isObstacle ? P.navy : P.surfaceAlt,
                            },
                          ]}
                        >
                          {isTarget && <Ionicons name="star" size={18} color="#FFFFFF" />}
                          {isObstacle && <Ionicons name="square" size={14} color="#FFFFFF" />}
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Transformation Rule Banner */}
                <View style={[styles.transformBanner, { width: arenaWidth }]}>
                  <Ionicons name="swap-horizontal-outline" size={18} color={P.navy} />
                  <Text style={styles.transformBannerText}>{currentTask.promptLabel}</Text>
                </View>

                {/* Destination Answer Grid */}
                <View style={styles.promptHeader}>
                  <Text style={styles.promptInstruction}>
                    {roundPhase === 'active'
                      ? 'SELECT TRANSFORMED TARGET'
                      : feedbackData?.text || 'READY'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.navigationLabyrinthGrid,
                    { width: arenaWidth, height: arenaWidth },
                  ]}
                >
                  {Array.from({ length: currentTask.gridSize * currentTask.gridSize }).map((_, cellIdx) => {
                    const isSelected = selectedChoiceId === cellIdx;
                    const isCorrect = currentTask.correctIndex === cellIdx;
                    const showFeedback = roundPhase === 'feedback';

                    return (
                      <TouchableOpacity
                        key={`dest_${cellIdx}`}
                        activeOpacity={0.8}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleSelectChoice(cellIdx)}
                        style={[
                          styles.navGridCell,
                          {
                            width: `${100 / currentTask.gridSize - 2}%`,
                            height: `${100 / currentTask.gridSize - 2}%`,
                            backgroundColor: showFeedback && isSelected
                              ? isCorrect
                                ? P.sage
                                : P.rose
                              : P.surface,
                            borderColor: showFeedback && isSelected
                              ? isCorrect
                                ? P.sage
                                : P.rose
                              : P.border,
                          },
                        ]}
                      >
                        {showFeedback && isCorrect && (
                          <Ionicons name="star" size={22} color={P.gold} />
                        )}
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

  /* ── Mental Rotation Styles ── */
  targetFigureCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  targetFigureLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  shapeGridContainer: {
    flexDirection: 'column',
    gap: 3,
  },
  shapeGridRow: {
    flexDirection: 'row',
    gap: 3,
  },
  shapeGridCell: {
    borderRadius: 3,
    borderWidth: 1,
  },
  rotationCandidatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  rotationCandidateCard: {
    width: 140,
    height: 120,
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  candidateLetterBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: P.navyMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidateLetterText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.navy,
  },
  optionCardWin: {
    borderColor: P.sage,
    backgroundColor: P.sageMuted,
  },
  optionCardLoss: {
    borderColor: P.rose,
    backgroundColor: P.roseMuted,
  },

  /* ── Spatial Navigation Labyrinth Grid ── */
  navigationLabyrinthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    backgroundColor: P.surfaceAlt,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 8,
  },
  navGridCell: {
    borderRadius: radii.sm,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAvatarDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: P.player,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  startBadgeText: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: P.navy,
  },
  pathCrumbDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: P.navyBorder,
  },

  /* ── Mirror Map Styles ── */
  sourceMapCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  miniMapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    maxWidth: 200,
  },
  miniMapCell: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transformBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: P.goldMuted,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: P.goldBorder,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  transformBannerText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.navy,
    letterSpacing: 0.8,
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
