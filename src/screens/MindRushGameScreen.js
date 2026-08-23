/**
 * OVERLOAD MindRushGameScreen
 * Premium Luxury Light Arcade Experience — Mind Rush
 * Supports 3 high-octane cognitive combat modes:
 * 1. Blast Logic (Rule-based target blasting)
 * 2. Chain Reaction (Cascading explosive node networks)
 * 3. Boss Breaker (Multi-phase cybernetic boss shield battles)
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
  MindRushEngine,
  MIND_RUSH_MODES,
  MIND_RUSH_MODE_DETAILS,
  SESSION_TYPES,
  COMBAT_PARAMS,
  getMindRushComboMultiplier,
} from '../games/mindRush';
import { ROUTES } from '../constants/routes';
import { triggerHaptic } from '../utils/haptics';

/* ── Premium Luxury Arcade Palette ── */
const P = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F2ED',
  border: '#E8E4DE',

  navy: '#1B2A4A',
  navyLight: '#2C3E5A',
  navyMuted: 'rgba(27, 42, 74, 0.06)',
  navyBorder: 'rgba(27, 42, 74, 0.12)',

  ember: '#EA580C',
  emberMuted: 'rgba(234, 88, 12, 0.12)',
  emberBorder: 'rgba(234, 88, 12, 0.40)',

  gold: '#F59E0B',
  goldMuted: 'rgba(245, 158, 11, 0.12)',
  goldBorder: 'rgba(245, 158, 11, 0.40)',

  cyan: '#0284C7',
  cyanMuted: 'rgba(2, 132, 199, 0.12)',
  cyanBorder: 'rgba(2, 132, 199, 0.40)',

  violet: '#8B5CF6',
  violetMuted: 'rgba(139, 92, 246, 0.12)',
  violetBorder: 'rgba(139, 92, 246, 0.40)',

  sage: '#10B981',
  sageMuted: 'rgba(16, 185, 129, 0.12)',
  sageBorder: 'rgba(16, 185, 129, 0.40)',

  rose: '#EF4444',
  roseMuted: 'rgba(239, 68, 68, 0.12)',
  roseBorder: 'rgba(239, 68, 68, 0.40)',

  text: '#1A1A2E',
  textSec: '#6B6B7B',
  textMuted: '#9E9EAE',
  textInverse: '#FFFFFF',

  danger: '#EF4444',
};

export default function MindRushGameScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const mode = route.params?.mode || MIND_RUSH_MODES.BLAST_LOGIC;
  const sessionType = route.params?.sessionType || SESSION_TYPES.QUICK;

  const topPad =
    Platform.OS === 'android'
      ? Math.max(StatusBar.currentHeight || 0, 24) + 8
      : Math.max(insets.top, 20) + 4;

  const [engine] = useState(() => new MindRushEngine({ mode, sessionType }));
  const [currentTask, setCurrentTask] = useState(null);

  // States: 'active' | 'feedback'
  const [roundPhase, setRoundPhase] = useState('active');
  const [feedbackData, setFeedbackData] = useState(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [activeChainNodes, setActiveChainNodes] = useState([]);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [roundNumber, setRoundNumber] = useState(1);
  const [energy, setEnergy] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(COMBAT_PARAMS.PLAYER_MAX_HEALTH);
  const [bossHealth, setBossHealth] = useState(COMBAT_PARAMS.BOSS_MAX_HEALTH);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isMountedRef = useRef(true);
  const isEvaluatingRef = useRef(false);
  const roundStartTimeRef = useRef(Date.now());
  const timeoutTimerRef = useRef(null);
  const nextRoundTimerRef = useRef(null);
  const navTimerRef = useRef(null);
  const chainStepTimerRef = useRef(null);

  // Explosion effect animation
  const explosionAnim = useRef(new Animated.Value(0)).current;
  const countdownAnim = useRef(new Animated.Value(1)).current;

  // Session clock
  useEffect(() => {
    isMountedRef.current = true;
    if (isPaused) return;
    const timer = setInterval(() => {
      if (isMountedRef.current) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [isPaused]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
      countdownAnim.stopAnimation();
    };
  }, []);

  const navigateToResults = useCallback(() => {
    if (!isMountedRef.current) return;
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    countdownAnim.stopAnimation();

    const summary = engine.getSessionSummary();
    navigation.replace(ROUTES.RESULTS, {
      summary: {
        gameType: 'mind-rush',
        facultyId: 'mind-rush',
        mode: currentTask?.mode || mode,
        totalRounds: summary.totalRounds,
        averageAccuracy: summary.averageAccuracy,
        averageResponseTimeMs: summary.averageResponseTimeMs,
        bestResponseTimeMs: summary.bestResponseTimeMs,
        score: summary.totalScore,
        bestCombo: summary.bestCombo,
        bestChain: summary.bestChain,
        bossDamage: summary.bossDamage,
        isBossDefeated: summary.isBossDefeated,
        correctCount: summary.correctCount,
        incorrectCount: summary.incorrectCount,
        timedOutCount: summary.timedOutCount,
        peakLevel: summary.peakLevel,
      },
      elapsedSeconds,
    });
  }, [engine, currentTask, mode, elapsedSeconds, navigation, countdownAnim]);

  // Handle Timeout
  const handleTimeout = useCallback((task) => {
    if (isEvaluatingRef.current || !isMountedRef.current) return;
    isEvaluatingRef.current = true;

    triggerHaptic('error');
    const result = engine.handleTimeout();

    if (isMountedRef.current) {
      setScore(result.totalScore);
      setCombo(result.currentCombo);
      setEnergy(result.energy);
      setPlayerHealth(result.playerHealth);
      setBossHealth(result.bossHealth);
      setRoundPhase('feedback');
      setFeedbackData({
        isCorrect: false,
        isTimedOut: true,
        text: mode === MIND_RUSH_MODES.BOSS_BREAKER ? 'BOSS HIT YOU! 💥' : 'TIME EXPIRED',
        subtext: 'Attack window lapsed',
      });
    }

    if (result.isSessionFinished) {
      navTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) navigateToResults();
      }, 900);
    } else {
      nextRoundTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) loadNextRound();
      }, 800);
    }
  }, [engine, mode, navigateToResults]);

  // Load next round
  const loadNextRound = useCallback(() => {
    if (!isMountedRef.current) return;
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);
    if (chainStepTimerRef.current) clearTimeout(chainStepTimerRef.current);

    const task = engine.startNextTask();
    setCurrentTask(task);
    setRoundNumber(engine.roundNumber);
    setLevel(engine.currentLevel);
    setCurrentPhase(engine.currentPhase);
    setRoundPhase('active');
    setFeedbackData(null);
    setSelectedChoiceId(null);
    setActiveChainNodes([]);
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
      if (!isEvaluatingRef.current && !isPaused && isMountedRef.current) {
        handleTimeout(task);
      }
    }, task.timeoutWindowMs);
  }, [engine, isPaused, countdownAnim, handleTimeout]);

  useEffect(() => {
    loadNextRound();
  }, []);

  // Submit User Action (Blast Target / Trigger Node / Boss Strike)
  const handleSelectChoice = (choiceId) => {
    if (isEvaluatingRef.current || isPaused || !currentTask || roundPhase !== 'active' || !isMountedRef.current) return;

    isEvaluatingRef.current = true;
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    countdownAnim.stopAnimation();

    const responseTimeMs = Date.now() - roundStartTimeRef.current;
    const result = engine.submitResponse(choiceId, responseTimeMs);

    setScore(result.totalScore);
    setCombo(result.currentCombo);
    setLevel(engine.currentLevel);
    setEnergy(result.energy);
    setPlayerHealth(result.playerHealth);
    setBossHealth(result.bossHealth);
    setCurrentPhase(result.currentPhase);
    setSelectedChoiceId(choiceId);
    setRoundPhase('feedback');

    if (mode === MIND_RUSH_MODES.CHAIN_REACTION) {
      if (result.evaluation.isCorrect) {
        const path = result.evaluation.solutionPath || [];
        // Staged propagation along path
        path.forEach((nodeId, idx) => {
          setTimeout(() => {
            if (isMountedRef.current) {
              setActiveChainNodes((prev) => [...prev, nodeId]);
              triggerHaptic(idx === path.length - 1 ? 'success' : 'light');
            }
          }, idx * 220);
        });

        // Trigger explosion on final node
        setTimeout(() => {
          if (isMountedRef.current) {
            explosionAnim.setValue(1);
            Animated.timing(explosionAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }).start();
          }
        }, Math.max(200, (path.length - 1) * 220));

        setFeedbackData({
          isCorrect: true,
          text: result.evaluation.feedbackMessage || 'CHAIN PROPAGATED! 💥',
          subtext: `+${result.evaluation.pointsAwarded} PTS · ${Math.round(responseTimeMs)} ms`,
        });
      } else {
        setActiveChainNodes([choiceId]);
        triggerHaptic('error');
        setFeedbackData({
          isCorrect: false,
          text: result.evaluation.feedbackMessage || 'CHAIN BROKEN',
          subtext: 'Wrong starting node · Combo Reset',
        });
      }
    } else {
      // Blast Logic & Boss Breaker
      if (result.evaluation.isCorrect) {
        triggerHaptic('heavy');
        explosionAnim.setValue(1);
        Animated.timing(explosionAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();

        setFeedbackData({
          isCorrect: true,
          text: result.evaluation.feedbackMessage || 'TARGET DETONATED! 💥',
          subtext: `+${result.evaluation.pointsAwarded} PTS · ${Math.round(responseTimeMs)} ms`,
        });
      } else {
        triggerHaptic('error');
        setFeedbackData({
          isCorrect: false,
          text: result.evaluation.feedbackMessage || 'MISFIRE',
          subtext: 'Combo Reset',
        });
      }
    }

    const transitionDelay =
      mode === MIND_RUSH_MODES.CHAIN_REACTION && result.evaluation.isCorrect
        ? Math.max(1100, (result.evaluation.solutionPath?.length || 1) * 240 + 600)
        : result.evaluation.isCorrect
        ? 750
        : 1050;

    if (result.isSessionFinished) {
      navTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) navigateToResults();
      }, transitionDelay);
    } else {
      nextRoundTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) loadNextRound();
      }, transitionDelay);
    }
  };

  // Trigger Special Attack
  const handleSpecialAttack = () => {
    if (energy < COMBAT_PARAMS.ENERGY_MAX || isEvaluatingRef.current || isPaused || !isMountedRef.current) return;

    triggerHaptic('heavy');
    const result = engine.triggerSpecialAttack();
    if (!result) return;

    setScore(engine.totalScore);
    setEnergy(0);
    setBossHealth(result.bossHealth);
    setCurrentPhase(result.currentPhase);

    Alert.alert('💥 SPECIAL ATTACK DEPLOYED!', 'Massive energy explosion dealt critical damage!');

    if (result.isBossDefeated) {
      navTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) navigateToResults();
      }, 900);
    }
  };

  const handlePauseToggle = () => {
    triggerHaptic('medium');
    setIsPaused((prev) => !prev);
  };

  const handleRestart = () => {
    triggerHaptic('medium');
    Alert.alert('Restart Arcade Run', 'Are you sure you want to reset this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restart',
        style: 'destructive',
        onPress: () => {
          if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
          if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);
          if (navTimerRef.current) clearTimeout(navTimerRef.current);
          setRoundNumber(1);
          setScore(0);
          setCombo(0);
          setEnergy(0);
          setPlayerHealth(COMBAT_PARAMS.PLAYER_MAX_HEALTH);
          setBossHealth(COMBAT_PARAMS.BOSS_MAX_HEALTH);
          setElapsedSeconds(0);
          engine.roundNumber = 0;
          engine.totalScore = 0;
          engine.currentCombo = 0;
          engine.bestCombo = 0;
          engine.energy = 0;
          engine.playerHealth = COMBAT_PARAMS.PLAYER_MAX_HEALTH;
          engine.bossHealth = COMBAT_PARAMS.BOSS_MAX_HEALTH;
          engine.sessionHistory = [];
          loadNextRound();
        },
      },
    ]);
  };

  const handleGiveUp = () => {
    triggerHaptic('warning');
    Alert.alert('End Run', 'Return to dashboard and record completed rounds?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Run',
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

  const modeDetails = MIND_RUSH_MODE_DETAILS[mode] || MIND_RUSH_MODE_DETAILS[MIND_RUSH_MODES.BLAST_LOGIC];
  const comboMultiplier = getMindRushComboMultiplier(combo);
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
              <Text style={styles.headerTitle}>Mind Rush</Text>
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
              <Text style={[styles.hudValue, { color: combo >= 3 ? P.ember : P.text }]}>
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

          {/* Energy Meter Bar */}
          <View style={styles.energyRow}>
            <View style={styles.energyLabelRow}>
              <Text style={styles.energyLabel}>⚡ ENERGY CHARGE: {energy}%</Text>
              {energy >= 100 && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleSpecialAttack}
                  style={styles.specialAttackPill}
                >
                  <Text style={styles.specialAttackText}>FIRE SPECIAL 💥</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.energyTrack}>
              <View
                style={[
                  styles.energyFill,
                  { width: `${energy}%`, backgroundColor: energy >= 100 ? P.gold : P.cyan },
                ]}
              />
            </View>
          </View>

          {/* Boss Breaker Health Bars */}
          {mode === MIND_RUSH_MODES.BOSS_BREAKER && (
            <View style={styles.bossCombatStatusRow}>
              <View style={styles.healthCol}>
                <Text style={styles.healthLabel}>PLAYER: {playerHealth} HP</Text>
                <View style={styles.healthTrack}>
                  <View
                    style={[
                      styles.healthFill,
                      {
                        width: `${(playerHealth / COMBAT_PARAMS.PLAYER_MAX_HEALTH) * 100}%`,
                        backgroundColor: P.sage,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.healthCol}>
                <Text style={styles.healthLabel}>BOSS: {bossHealth} HP (PHASE {currentPhase}/5)</Text>
                <View style={styles.healthTrack}>
                  <View
                    style={[
                      styles.healthFill,
                      {
                        width: `${(bossHealth / COMBAT_PARAMS.BOSS_MAX_HEALTH) * 100}%`,
                        backgroundColor: P.rose,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

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

        {/* ── CENTER INTERACTIVE ARCADE AREA ── */}
        <View style={styles.centerSection}>
          <ScrollView
            contentContainerStyle={styles.scrollCenter}
            showsVerticalScrollIndicator={false}
          >
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 1: BLAST LOGIC                                            */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === MIND_RUSH_MODES.BLAST_LOGIC && currentTask && (
              <View style={styles.gameContainer}>
                {/* Active Rule Banner */}
                <View style={[styles.activeRuleBanner, { width: arenaWidth }]}>
                  <Ionicons name="flash-outline" size={18} color={P.ember} />
                  <Text style={styles.activeRuleText}>{currentTask.rule || currentTask.ruleText}</Text>
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
                      : feedbackData?.subtext || 'Detonation verified'}
                  </Text>
                </View>

                {/* Floating Blast Targets */}
                <View style={[styles.blastTargetsGrid, { width: arenaWidth }]}>
                  {currentTask.targets?.map((target) => {
                    const isSelected = selectedChoiceId === target.id;
                    const isCorrect = currentTask.correctTargetId === target.id;

                    return (
                      <TouchableOpacity
                        key={target.id}
                        activeOpacity={0.8}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleSelectChoice(target.id)}
                        style={[
                          styles.blastTargetCard,
                          {
                            borderColor: target.color?.hex || P.border,
                            backgroundColor: P.surface,
                          },
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        <Ionicons
                          name={target.shape?.icon || 'ellipse'}
                          size={28}
                          color={target.color?.hex || P.navy}
                        />
                        <Text style={styles.targetNumberText}>
                          {target.value !== undefined ? target.value : target.number}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 2: CHAIN REACTION                                         */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === MIND_RUSH_MODES.CHAIN_REACTION && currentTask && (
              <View style={styles.gameContainer}>
                {/* Objective Banner */}
                <View style={[styles.activeRuleBanner, { width: arenaWidth }]}>
                  <Ionicons name="git-network-outline" size={18} color={P.cyan} />
                  <Text style={styles.activeRuleText}>{currentTask.objective || currentTask.rulePrompt}</Text>
                </View>

                <View style={styles.promptHeader}>
                  <Text style={styles.promptInstruction}>
                    {roundPhase === 'active'
                      ? currentTask.instructionText || 'PLAN CHAIN SEQUENCE'
                      : feedbackData?.text || 'READY'}
                  </Text>
                  <Text style={styles.promptSubtext}>
                    {roundPhase === 'active'
                      ? 'Select the optimal starting node'
                      : feedbackData?.subtext || 'Chain verified'}
                  </Text>
                </View>

                {/* Interactive Network Canvas */}
                <View style={[styles.networkCanvas, { width: arenaWidth, height: 230 }]}>
                  {/* Render Network Links */}
                  {currentTask.connections?.map(([fromId, toId], idx) => {
                    const fromNode = currentTask.nodes?.find((n) => n.id === fromId);
                    const toNode = currentTask.nodes?.find((n) => n.id === toId);
                    if (!fromNode || !toNode) return null;

                    const x1 = fromNode.x + 20;
                    const y1 = fromNode.y + 20;
                    const x2 = toNode.x + 20;
                    const y2 = toNode.y + 20;
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const dist = Math.hypot(dx, dy);
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    const isLinkActive =
                      activeChainNodes.includes(fromId) && activeChainNodes.includes(toId);

                    return (
                      <View
                        key={`link_${idx}_${fromId}_${toId}`}
                        style={[
                          styles.networkLinkLine,
                          {
                            left: x1,
                            top: y1,
                            width: dist,
                            backgroundColor: isLinkActive ? P.sage : P.border,
                            height: isLinkActive ? 3 : 1.5,
                            transform: [{ rotate: `${angle}deg` }],
                          },
                        ]}
                      />
                    );
                  })}

                  {/* Render Network Nodes */}
                  {currentTask.nodes?.map((node) => {
                    const isSelected = selectedChoiceId === node.id;
                    const isInActiveChain = activeChainNodes.includes(node.id);
                    const isCorrectStart = currentTask.correctStartNodeId === node.id;
                    const isForbidden = currentTask.forbiddenNodeId === node.id;
                    const isDestination = currentTask.targetDestinationNodeId === node.id;

                    return (
                      <TouchableOpacity
                        key={node.id}
                        activeOpacity={0.85}
                        disabled={isPaused || isEvaluatingRef.current || !node.isStart}
                        onPress={() => handleSelectChoice(node.id)}
                        style={[
                          styles.networkNodeCircle,
                          {
                            left: node.x,
                            top: node.y,
                            borderColor: isInActiveChain
                              ? P.sage
                              : isSelected && !isCorrectStart
                              ? P.rose
                              : node.color?.hex || P.border,
                            backgroundColor: isInActiveChain
                              ? P.sageMuted
                              : isSelected && !isCorrectStart
                              ? P.roseMuted
                              : P.surface,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.networkNodeLabel,
                            {
                              color: isInActiveChain
                                ? P.sage
                                : isSelected && !isCorrectStart
                                ? P.rose
                                : P.navy,
                            },
                          ]}
                        >
                          {node.label}
                        </Text>
                        {isDestination && (
                          <View style={styles.nodeDestBadge}>
                            <Ionicons name="flag" size={10} color={P.gold} />
                          </View>
                        )}
                        {isForbidden && (
                          <View style={styles.nodeForbiddenBadge}>
                            <Ionicons name="close" size={10} color={P.rose} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Candidate Action Buttons */}
                <View style={[styles.chainCandidateRow, { width: arenaWidth }]}>
                  {currentTask.candidateStartNodes?.map((cand) => {
                    const isSelected = selectedChoiceId === cand.id;
                    const isCorrect = currentTask.correctStartNodeId === cand.id;

                    return (
                      <TouchableOpacity
                        key={cand.id}
                        activeOpacity={0.8}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleSelectChoice(cand.id)}
                        style={[
                          styles.chainCandidateBtn,
                          { borderColor: cand.color?.hex || P.navy },
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        <Text style={styles.chainCandidateBtnText}>TRIGGER ({cand.label})</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* GAME 3: BOSS BREAKER                                            */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mode === MIND_RUSH_MODES.BOSS_BREAKER && currentTask && (
              <View style={styles.gameContainer}>
                {/* Cyber Boss Avatar Card */}
                <View style={[styles.bossAvatarCard, { width: arenaWidth }]}>
                  <View style={styles.bossAvatarIconCircle}>
                    <Ionicons name="hardware-chip" size={38} color={P.ember} />
                  </View>
                  <Text style={styles.bossAvatarTitle}>CYBER-TITAN CORE</Text>
                  <Text style={styles.bossAvatarSubtitle}>
                    Shield Barrier {currentPhase} / 5 Active
                  </Text>
                </View>

                <View style={styles.promptHeader}>
                  <Text style={styles.promptInstruction}>
                    {roundPhase === 'active'
                      ? currentTask.promptText
                      : feedbackData?.text || 'READY'}
                  </Text>
                  <Text style={styles.promptSubtext}>
                    {roundPhase === 'active'
                      ? currentTask.actionPrompt
                      : feedbackData?.subtext || 'Strike evaluated'}
                  </Text>
                </View>

                {/* Strike Action Buttons */}
                <View style={[styles.blastTargetsGrid, { width: arenaWidth }]}>
                  {currentTask.options?.map((opt) => {
                    const isSelected = selectedChoiceId === opt.id;
                    const isCorrect = currentTask.correctOptionId === opt.id;

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.8}
                        disabled={isPaused || isEvaluatingRef.current}
                        onPress={() => handleSelectChoice(opt.id)}
                        style={[
                          styles.bossStrikeCard,
                          isSelected && (isCorrect ? styles.optionCardWin : styles.optionCardLoss),
                        ]}
                      >
                        <View style={styles.candidateLetterBadge}>
                          <Text style={styles.candidateLetterText}>{opt.letter}</Text>
                        </View>
                        {opt.icon ? (
                          <Ionicons name={opt.icon} size={24} color={P.navy} />
                        ) : (
                          <Text style={styles.strikeOptionText}>{opt.label}</Text>
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
              <Text style={styles.controlBtnDangerText}>End Run</Text>
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
    color: P.ember,
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

  /* ── Energy Meter ── */
  energyRow: {
    marginTop: 8,
  },
  energyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  energyLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    letterSpacing: 0.8,
  },
  specialAttackPill: {
    backgroundColor: P.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  specialAttackText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  energyTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: P.surfaceAlt,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    borderRadius: 3,
  },

  /* ── Boss Combat Status ── */
  bossCombatStatusRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  healthCol: {
    flex: 1,
  },
  healthLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: P.textSec,
    marginBottom: 3,
  },
  healthTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: P.surfaceAlt,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: 3,
  },

  /* ── Countdown Bar ── */
  countdownTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: P.surfaceAlt,
    overflow: 'hidden',
    marginTop: 8,
  },
  countdownFill: {
    height: '100%',
    backgroundColor: P.ember,
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

  /* ── Blast Logic UI ── */
  activeRuleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.emberBorder,
    padding: 12,
    marginBottom: 14,
  },
  activeRuleText: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: P.ember,
    letterSpacing: 0.5,
  },
  blastTargetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  blastTargetCard: {
    width: '48%',
    height: 90,
    borderRadius: radii.card,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  targetNumberText: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: P.text,
  },

  /* ── Chain Reaction UI ── */
  networkCanvas: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12,
  },
  networkLinkLine: {
    position: 'absolute',
    borderRadius: 1,
  },
  networkNodeCircle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  networkNodeLabel: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
  },
  nodeDestBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: P.surface,
    borderWidth: 1,
    borderColor: P.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeForbiddenBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: P.surface,
    borderWidth: 1,
    borderColor: P.rose,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chainCandidateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  chainCandidateBtn: {
    flex: 1,
    height: 48,
    borderRadius: radii.card,
    backgroundColor: P.surface,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  chainCandidateBtnText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: P.navy,
    letterSpacing: 0.5,
  },

  /* ── Boss Breaker UI ── */
  bossAvatarCard: {
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  bossAvatarIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: P.emberMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bossAvatarTitle: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: P.navy,
    letterSpacing: 1,
  },
  bossAvatarSubtitle: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: P.textSec,
    marginTop: 2,
  },
  bossStrikeCard: {
    width: '48%',
    height: 65,
    backgroundColor: P.surface,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: P.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  strikeOptionText: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: P.navy,
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
