/**
 * OVERLOAD - Decision Making Engine
 * Decoupled controller coordinating infinite task generation, multi-attribute evaluation,
 * probabilistic outcomes, combo tracking, and adaptive difficulty for Decision Making.
 */

import { DECISION_MODES, SESSION_TYPES, DECISION_DIFFICULTY_PARAMS } from './decisionConstants.js';
import { generateDecisionTask } from './decisionGenerator.js';
import { evaluateDecisionResponse } from './decisionEvaluator.js';
import { calculateNextDecisionDifficulty } from './decisionDifficulty.js';

export class DecisionEngine {
  constructor({
    mode = DECISION_MODES.PRIORITY_SORT,
    sessionType = SESSION_TYPES.QUICK,
    initialDifficulty = DECISION_DIFFICULTY_PARAMS.initialLevel,
  } = {}) {
    this.mode = mode;
    this.sessionType = sessionType;
    this.currentLevel = Math.max(1, Math.min(10, initialDifficulty));
    this.roundNumber = 0;

    this.currentTask = null;
    this.currentCombo = 0;
    this.bestCombo = 0;
    this.totalScore = 0;

    this.consecutiveCorrect = 0;
    this.consecutiveErrors = 0;
    this.sessionHistory = [];
    this.peakLevelReached = this.currentLevel;

    this.maxRounds =
      sessionType === SESSION_TYPES.QUICK
        ? DECISION_DIFFICULTY_PARAMS.quickRounds
        : sessionType === SESSION_TYPES.STANDARD
        ? DECISION_DIFFICULTY_PARAMS.standardRounds
        : null; // null for ENDLESS
  }

  /**
   * Starts and returns the next dynamic decision task.
   */
  startNextTask() {
    this.roundNumber += 1;
    this.currentTask = generateDecisionTask({
      mode: this.mode,
      difficultyLevel: this.currentLevel,
      roundNumber: this.roundNumber,
    });
    return this.currentTask;
  }

  /**
   * Submits user response for the active decision round.
   */
  submitResponse(userResponse = null, responseTimeMs = 0, isTimedOut = false) {
    if (!this.currentTask) {
      throw new Error('No active task to evaluate.');
    }

    const evaluation = evaluateDecisionResponse({
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
    const nextDiff = calculateNextDecisionDifficulty({
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
   * Produces aggregated session summary telemetry.
   */
  getSessionSummary() {
    const totalRounds = this.sessionHistory.length;
    if (totalRounds === 0) {
      return {
        gameType: 'decision',
        facultyId: 'decision',
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
        averageDecisionQuality: 0,
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

    const dqEvaluations = this.sessionHistory.filter((e) => typeof e.decisionQuality === 'number');
    const averageDecisionQuality =
      dqEvaluations.length > 0
        ? Math.round(dqEvaluations.reduce((sum, e) => sum + e.decisionQuality, 0) / dqEvaluations.length)
        : averageAccuracy;

    return {
      gameType: 'decision',
      facultyId: 'decision',
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
      averageDecisionQuality,
      difficultyReached: this.currentLevel,
      peakLevel: this.peakLevelReached,
    };
  }
}

export default DecisionEngine;
