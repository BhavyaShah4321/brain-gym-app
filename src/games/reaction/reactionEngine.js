/**
 * OVERLOAD - Reaction Engine
 * Decoupled controller coordinating infinite task generation, millisecond timing,
 * false start detection, combo tracking, and adaptive difficulty.
 */

import { REACTION_MODES, SESSION_TYPES, REACTION_DIFFICULTY_PARAMS } from './reactionConstants';
import { generateReactionTask } from './reactionGenerator';
import { evaluateReactionResponse } from './reactionEvaluator';
import { calculateNextReactionDifficulty } from './reactionDifficulty';

export class ReactionEngine {
  constructor({
    mode = REACTION_MODES.TARGET_TAP,
    sessionType = SESSION_TYPES.QUICK,
    initialDifficulty = REACTION_DIFFICULTY_PARAMS.initialLevel,
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
    this.consecutiveFalseStarts = 0;
    this.sessionHistory = [];
    this.peakLevelReached = this.currentLevel;

    this.maxRounds =
      sessionType === SESSION_TYPES.QUICK
        ? REACTION_DIFFICULTY_PARAMS.quickRounds
        : sessionType === SESSION_TYPES.STANDARD
        ? REACTION_DIFFICULTY_PARAMS.standardRounds
        : null; // null for ENDLESS
  }

  /**
   * Starts and returns the next dynamic task.
   */
  startNextTask() {
    this.roundNumber += 1;
    this.currentTask = generateReactionTask({
      mode: this.mode,
      difficultyLevel: this.currentLevel,
      roundNumber: this.roundNumber,
    });
    return this.currentTask;
  }

  /**
   * Submits user response for the active round.
   */
  submitResponse({
    userResponse = null,
    responseTimeMs = 0,
    isFalseStart = false,
    isTimedOut = false,
  } = {}) {
    if (!this.currentTask) {
      throw new Error('No active task to evaluate.');
    }

    const evaluation = evaluateReactionResponse({
      task: this.currentTask,
      userResponse,
      responseTimeMs,
      isFalseStart,
      isTimedOut,
      currentCombo: this.currentCombo,
    });

    if (evaluation.isCorrect) {
      this.currentCombo += 1;
      this.consecutiveCorrect += 1;
      this.consecutiveErrors = 0;
      this.consecutiveFalseStarts = 0;
      this.totalScore = Math.max(0, this.totalScore + evaluation.pointsAwarded);
      if (this.currentCombo > this.bestCombo) {
        this.bestCombo = this.currentCombo;
      }
    } else if (evaluation.isFalseStart) {
      this.currentCombo = 0;
      this.consecutiveCorrect = 0;
      this.consecutiveFalseStarts += 1;
      this.totalScore = Math.max(0, this.totalScore - evaluation.penaltyPoints);
    } else {
      this.currentCombo = 0;
      this.consecutiveCorrect = 0;
      this.consecutiveErrors += 1;
      this.totalScore = Math.max(0, this.totalScore - evaluation.penaltyPoints);
    }

    this.sessionHistory.push(evaluation);

    // Calculate adaptive difficulty for subsequent task
    const nextDiff = calculateNextReactionDifficulty({
      currentLevel: this.currentLevel,
      recentEvaluations: this.sessionHistory,
      consecutiveCorrect: this.consecutiveCorrect,
      consecutiveErrors: this.consecutiveErrors,
      consecutiveFalseStarts: this.consecutiveFalseStarts,
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
   * Evaluates a false start tap (too early).
   */
  handleFalseStart() {
    return this.submitResponse({ isFalseStart: true });
  }

  /**
   * Evaluates a timeout when no tap occurs before deadline.
   */
  handleTimeout() {
    return this.submitResponse({ isTimedOut: true, responseTimeMs: this.currentTask?.timeoutWindowMs || 2000 });
  }

  /**
   * Produces aggregated session summary telemetry.
   */
  getSessionSummary() {
    const totalRounds = this.sessionHistory.length;
    if (totalRounds === 0) {
      return {
        gameType: 'reaction',
        mode: this.mode,
        totalRounds: 0,
        correctCount: 0,
        incorrectCount: 0,
        falseStartCount: 0,
        timedOutCount: 0,
        averageAccuracy: 0,
        averageReactionTimeMs: 0,
        bestReactionTimeMs: 0,
        bestCombo: 0,
        totalScore: 0,
        difficultyReached: this.currentLevel,
        peakLevel: this.peakLevelReached,
      };
    }

    const correctCount = this.sessionHistory.filter((e) => e.isCorrect).length;
    const falseStartCount = this.sessionHistory.filter((e) => e.isFalseStart).length;
    const timedOutCount = this.sessionHistory.filter((e) => e.isTimedOut).length;
    const incorrectCount = totalRounds - correctCount;

    const averageAccuracy = Math.round((correctCount / totalRounds) * 100);

    const validReactionTimes = this.sessionHistory
      .filter((e) => e.isCorrect && e.responseTimeMs > 0)
      .map((e) => e.responseTimeMs);

    const averageReactionTimeMs =
      validReactionTimes.length > 0
        ? Math.round(validReactionTimes.reduce((sum, t) => sum + t, 0) / validReactionTimes.length)
        : 0;

    const bestReactionTimeMs =
      validReactionTimes.length > 0 ? Math.min(...validReactionTimes) : 0;

    return {
      gameType: 'reaction',
      mode: this.mode,
      totalRounds,
      correctCount,
      incorrectCount,
      falseStartCount,
      timedOutCount,
      averageAccuracy,
      averageReactionTimeMs,
      bestReactionTimeMs,
      bestCombo: this.bestCombo,
      totalScore: this.totalScore,
      difficultyReached: this.currentLevel,
      peakLevel: this.peakLevelReached,
    };
  }
}

export default ReactionEngine;
