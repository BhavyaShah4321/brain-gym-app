/**
 * OVERLOAD - Cognitive Flexibility Engine
 * Decoupled controller coordinating infinite task generation, rule switching,
 * switch accuracy tracking, and adaptive difficulty for Cognitive Flexibility.
 */

import {
  FLEXIBILITY_MODES,
  SESSION_TYPES,
  FLEXIBILITY_DIFFICULTY_PARAMS,
} from './flexibilityConstants.js';
import { generateFlexibilityTask } from './flexibilityGenerator.js';
import { evaluateFlexibilityResponse } from './flexibilityEvaluator.js';
import { calculateNextFlexibilityDifficulty } from './flexibilityDifficulty.js';

export class FlexibilityEngine {
  constructor({
    mode = FLEXIBILITY_MODES.SORT_SHIFT,
    sessionType = SESSION_TYPES.QUICK,
    initialDifficulty = FLEXIBILITY_DIFFICULTY_PARAMS.initialLevel,
  } = {}) {
    this.mode = mode;
    this.sessionType = sessionType;
    this.currentLevel = Math.max(1, Math.min(10, initialDifficulty));
    this.roundNumber = 0;

    this.currentTask = null;
    this.currentCombo = 0;
    this.bestCombo = 0;
    this.totalScore = 0;
    this.activeRule = null;

    this.consecutiveCorrect = 0;
    this.consecutiveErrors = 0;
    this.sessionHistory = [];
    this.peakLevelReached = this.currentLevel;

    this.maxRounds =
      sessionType === SESSION_TYPES.QUICK
        ? FLEXIBILITY_DIFFICULTY_PARAMS.quickRounds
        : sessionType === SESSION_TYPES.STANDARD
        ? FLEXIBILITY_DIFFICULTY_PARAMS.standardRounds
        : null; // null for ENDLESS
  }

  /**
   * Starts and returns the next dynamic flexibility task.
   */
  startNextTask() {
    this.roundNumber += 1;
    this.currentTask = generateFlexibilityTask({
      mode: this.mode,
      difficultyLevel: this.currentLevel,
      roundNumber: this.roundNumber,
      previousRule: this.activeRule,
    });
    if (this.currentTask?.activeRule) {
      this.activeRule = this.currentTask.activeRule;
    }
    return this.currentTask;
  }

  /**
   * Submits user response for the active flexibility round.
   */
  submitResponse(userResponse = null, responseTimeMs = 0, isTimedOut = false) {
    if (!this.currentTask) {
      throw new Error('No active flexibility task to evaluate.');
    }

    const evaluation = evaluateFlexibilityResponse({
      task: this.currentTask,
      userResponse,
      responseTimeMs,
      isTimedOut,
      currentCombo: this.currentCombo,
    });

    if (evaluation.isCorrect) {
      this.currentCombo += 1;
      this.consecutiveCorrect += 1;
      this.consecutiveErrors = 0;
      this.totalScore = Math.max(0, this.totalScore + evaluation.pointsAwarded);
      if (this.currentCombo > this.bestCombo) {
        this.bestCombo = this.currentCombo;
      }
    } else {
      this.currentCombo = 0;
      this.consecutiveCorrect = 0;
      this.consecutiveErrors += 1;
      this.totalScore = Math.max(0, this.totalScore - evaluation.penaltyPoints);
    }

    this.sessionHistory.push(evaluation);

    // Calculate adaptive difficulty for subsequent task
    const nextDiff = calculateNextFlexibilityDifficulty({
      currentLevel: this.currentLevel,
      recentEvaluations: this.sessionHistory,
      consecutiveCorrect: this.consecutiveCorrect,
      consecutiveErrors: this.consecutiveErrors,
    });

    this.currentLevel = nextDiff.nextLevel;
    if (this.currentLevel > this.peakLevelReached) {
      this.peakLevelReached = this.currentLevel;
    }

    const isSessionFinished = this.maxRounds !== null && this.roundNumber >= this.maxRounds;

    return {
      evaluation,
      nextDifficulty: nextDiff,
      currentCombo: this.currentCombo,
      bestCombo: this.bestCombo,
      totalScore: this.totalScore,
      isSessionFinished,
      sessionSummary: this.getSessionSummary(),
    };
  }

  /**
   * Evaluates a timeout when no choice is submitted before deadline.
   */
  handleTimeout() {
    return this.submitResponse(null, this.currentTask?.timeoutWindowMs || 6000, true);
  }

  /**
   * Produces aggregated session summary telemetry with Rule-Switch metrics.
   */
  getSessionSummary() {
    const totalRounds = this.sessionHistory.length;
    if (totalRounds === 0) {
      return {
        gameType: 'flexibility',
        facultyId: 'flexibility',
        mode: this.mode,
        totalRounds: 0,
        correctCount: 0,
        incorrectCount: 0,
        timedOutCount: 0,
        averageAccuracy: 0,
        averageResponseTimeMs: 0,
        bestResponseTimeMs: 0,
        bestCombo: 0,
        totalScore: 0,
        ruleSwitchAccuracy: 0,
        difficultyReached: this.currentLevel,
        peakLevel: this.peakLevelReached,
      };
    }

    const correctCount = this.sessionHistory.filter((e) => e.isCorrect).length;
    const timedOutCount = this.sessionHistory.filter((e) => e.isTimedOut).length;
    const incorrectCount = totalRounds - correctCount;

    const averageAccuracy = Math.round((correctCount / totalRounds) * 100);

    const validResponseTimes = this.sessionHistory
      .filter((e) => e.isCorrect && e.responseTimeMs > 0)
      .map((e) => e.responseTimeMs);

    const averageResponseTimeMs =
      validResponseTimes.length > 0
        ? Math.round(validResponseTimes.reduce((sum, t) => sum + t, 0) / validResponseTimes.length)
        : 0;

    const bestResponseTimeMs =
      validResponseTimes.length > 0 ? Math.min(...validResponseTimes) : 0;

    // Rule Switch specific telemetry
    const switchTrials = this.sessionHistory.filter((e) => e.isRuleShiftTrial);
    const switchCorrect = switchTrials.filter((e) => e.isCorrect).length;
    const ruleSwitchAccuracy =
      switchTrials.length > 0
        ? Math.round((switchCorrect / switchTrials.length) * 100)
        : averageAccuracy;

    return {
      gameType: 'flexibility',
      facultyId: 'flexibility',
      mode: this.mode,
      totalRounds,
      correctCount,
      incorrectCount,
      timedOutCount,
      averageAccuracy,
      averageResponseTimeMs,
      bestResponseTimeMs,
      bestCombo: this.bestCombo,
      totalScore: this.totalScore,
      ruleSwitchAccuracy,
      difficultyReached: this.currentLevel,
      peakLevel: this.peakLevelReached,
    };
  }
}

export default FlexibilityEngine;
