/**
 * OVERLOAD FlexibilityGameScreen
 * Premium Luxury Light Theme — Cognitive Flexibility & Mental Set Shifting
 * Supports 3 distinct cognitive flexibility games:
 * 1. Sort Shift (Global sorting dimension transitions & mental set shifting)
 * 2. Pattern Shift (Mid-sequence structural rule transitions)
 * 3. Dual Rule (Context-dependent rule dispatching)
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
  FlexibilityEngine,
  FLEXIBILITY_MODES,
  FLEXIBILITY_MODE_DETAILS,
  SESSION_TYPES,
  getFlexibilityComboMultiplier,
} from '../games/flexibility';
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

  pink: '#EC4899',
  pinkMuted: 'rgba(236, 72, 153, 0.12)',
  pinkBorder: 'rgba(236, 72, 153, 0.40)',

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

export default function FlexibilityGameScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const mode = route.params?.mode || FLEXIBILITY_MODES.SORT_SHIFT;
  const sessionType = route.params?.sessionType || SESSION_TYPES.QUICK;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 8
      : Math.max(insets.top, 20) + 4;

  const [engine] = useState(() => new FlexibilityEngine({ mode, sessionType }));
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
      subtext: 'Rule adaptation window exceeded',
    });

    if (result.isSessionFinished) {
      setTimeout(() => navigateToResults(), 800);
    } else {
      setTimeout(() => loadNextRound(), 750);
    }
  };

  // Submit User Flexibility Choice
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
        text: result.evaluation.feedbackMessage || 'CORRECT SHIFT',
        subtext: result.evaluation.isRuleShiftTrial
          ? 'Rule Shift Mastered!'
          : `${Math.round(responseTimeMs)} ms · High Flexibility`,
      });
    } else {
      triggerHaptic('error');
      setFeedbackData({
        isCorrect: false,
        text: result.evaluation.feedbackMessage || 'RULE MISMATCH',
        subtext: 'Verify active sorting dimension',
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
        gameType: 'flexibility',
        facultyId: 'flexibility',
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
        ruleSwitchAccuracy: summary.ruleSwitchAccuracy,
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

  const modeDetails = FLEXIBILITY_MODE_DETAILS[mode] || FLEXIBILITY_MODE_DETAILS[FLEXIBILITY_MODES.SORT_SHIFT];
  const comboMultiplier = getFlexibilityComboMultiplier(combo);
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
              <Text style={styles.headerTitle}>Cognitive Flexibility</Text>
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
              <Text style={[styles.hudValue, { color: combo >= 3 ? P.pink : P.text }]}>
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

        {/* ── CENTER INTERACTIVE FLEXIBILITY AREA ── */}
        <View style={styles.centerSection}>
          <ScrollView
            contentContainerStyle={styles.scrollCenter}
            showsVerticalScrollIndicator={false}
          >
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 1: SORT SHIFT                                             */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === FLEXIBILITY_MODES.SORT_SHIFT && currentTask && (
              <View style={styles.gameContainer}>
                {/* Active Global Sorting Rule Banner */}
                <View
                  style={[
                    styles.activeRuleBanner,
                    { width: arenaWidth },
                    currentTask.isRuleShiftTrial && styles.ruleShiftPulseBanner,
                  ]}
                >
                  <Text style={styles.ruleBannerLabel}>
                    {currentTask.isRuleShiftTrial ? '✦ RULE SHIFT DETECTED ✦' : 'ACTIVE SORTING RULE'}
                  </Text>
                  <Text style={styles.ruleBannerTitle}>SORT BY {currentTask.activeRule}</Text>
                </View>

                {/* Stimulus Object Card */}
                <View style={[styles.stimulusCard, { width: arenaWidth }]}>
                  <Ionicons
                    name={currentTask.stimulus.shape.icon}
                    size={Math.round(64 * (currentTask.stimulus.size?.scale || 1))}
                    color={currentTask.stimulus.color.hex}
                  />
                  <Text style={styles.stimulusSubtext}>{currentTask.stimulus.label}</Text>
                </View>

                {/* Category Options */}
                <View style={[styles.categoryOptionsGrid, { width: arenaWidth }]}>
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
                          styles.categoryOptionButton,
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        {opt.type === 'COLOR' ? (
                          <View style={styles.colorPillRow}>
                            <View style={[styles.colorDot, { backgroundColor: opt.hex }]} />
                            <Text style={styles.categoryOptionText}>{opt.label}</Text>
                          </View>
                        ) : opt.type === 'SHAPE' ? (
                          <View style={styles.colorPillRow}>
                            <Ionicons name={opt.icon} size={20} color={P.navy} />
                            <Text style={styles.categoryOptionText}>{opt.label}</Text>
                          </View>
                        ) : (
                          <Text style={styles.categoryOptionText}>{opt.label}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 2: PATTERN SHIFT                                           */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === FLEXIBILITY_MODES.PATTERN_SHIFT && currentTask && (
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
                      : feedbackData?.subtext || 'Processing pattern transition...'}
                  </Text>
                </View>

                {/* Transitioning Pattern Sequence Display */}
                <View style={[styles.patternSequenceCard, { width: arenaWidth }]}>
                  <View style={styles.patternSequenceRow}>
                    {currentTask.sequence?.map((item, idx) => (
                      <View key={`pat_${idx}`} style={styles.patternItemNode}>
                        <Ionicons name={item.icon} size={24} color={item.color} />
                      </View>
                    ))}
                    <View style={[styles.patternItemNode, styles.patternPlaceholderNode]}>
                      <Text style={styles.patternPlaceholderText}>?</Text>
                    </View>
                  </View>
                </View>

                {/* Candidate Options Grid */}
                <View style={[styles.patternOptionsGrid, { width: arenaWidth }]}>
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
                          styles.patternOptionCard,
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        <View style={styles.candidateLetterBadge}>
                          <Text style={styles.candidateLetterText}>{opt.letter}</Text>
                        </View>
                        <Ionicons name={opt.icon} size={30} color={opt.color} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 3: DUAL RULE                                               */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === FLEXIBILITY_MODES.DUAL_RULE && currentTask && (
              <View style={styles.gameContainer}>
                {/* Context Condition Key Banner */}
                <View style={[styles.contextKeyBanner, { width: arenaWidth }]}>
                  <Text style={styles.contextKeyLabel}>CONTEXTUAL DISPATCH RULE</Text>
                  <Text style={styles.contextKeyTitle}>
                    {currentTask.instructionText}
                  </Text>
                </View>

                {/* Conditioned Stimulus Display */}
                <View
                  style={[
                    styles.dualStimulusCard,
                    {
                      width: arenaWidth,
                      borderColor: currentTask.activeContext.hex,
                      backgroundColor: `${currentTask.activeContext.hex}14`,
                    },
                  ]}
                >
                  <View style={styles.dualStimulusIconsRow}>
                    {Array.from({ length: currentTask.stimulus.count }).map((_, i) => (
                      <Ionicons
                        key={`icon_${i}`}
                        name={currentTask.stimulus.shape.icon}
                        size={36}
                        color={currentTask.stimulus.color.hex}
                      />
                    ))}
                  </View>
                  <Text style={styles.dualStimulusTag}>
                    Context: {currentTask.activeContext.colorName}
                  </Text>
                </View>

                {/* Candidate Options */}
                <View style={[styles.categoryOptionsGrid, { width: arenaWidth }]}>
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
                          styles.categoryOptionButton,
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        {opt.type === 'SHAPE' ? (
                          <View style={styles.colorPillRow}>
                            <Ionicons name={opt.icon} size={20} color={P.navy} />
                            <Text style={styles.categoryOptionText}>{opt.label}</Text>
                          </View>
                        ) : opt.type === 'COLOR' ? (
                          <View style={styles.colorPillRow}>
                            <View style={[styles.colorDot, { backgroundColor: opt.hex }]} />
                            <Text style={styles.categoryOptionText}>{opt.label}</Text>
                          </View>
                        ) : (
                          <Text style={styles.categoryOptionText}>{opt.label}</Text>
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
    backgroundColor: P.pink,
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

  /* ── Sort Shift UI ── */
  activeRuleBanner: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  ruleShiftPulseBanner: {
    borderColor: P.pink,
    backgroundColor: P.pinkMuted,
  },
  ruleBannerLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.pink,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  ruleBannerTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: P.navy,
    letterSpacing: -0.2,
  },
  stimulusCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  stimulusSubtext: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: P.textSec,
    marginTop: 8,
  },
  categoryOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoryOptionButton: {
    width: '48%',
    height: 52,
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: P.text,
  },
  colorPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  /* ── Pattern Shift UI ── */
  patternSequenceCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  patternSequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  patternItemNode: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: P.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: P.border,
  },
  patternPlaceholderNode: {
    borderColor: P.pink,
    backgroundColor: P.pinkMuted,
  },
  patternPlaceholderText: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: P.pink,
  },
  patternOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  patternOptionCard: {
    width: '48%',
    height: 80,
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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

  /* ── Dual Rule UI ── */
  contextKeyBanner: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  contextKeyLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  contextKeyTitle: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: P.navy,
    textAlign: 'center',
  },
  dualStimulusCard: {
    borderRadius: radii.card,
    borderWidth: 2,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dualStimulusIconsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dualStimulusTag: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: P.navy,
    letterSpacing: 0.8,
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
