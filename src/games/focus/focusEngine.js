/**
 * OVERLOAD - Focus Engine
 * Isolated engine coordinating infinite task generation, evaluation, combo tracking,
 * and adaptive difficulty progression for selective attention and visual tracking.
 */

import { FOCUS_MODES, SESSION_TYPES, FOCUS_DIFFICULTY_PARAMS } from './focusConstants';
import { generateFocusTask } from './focusGenerator';
import { evaluateFocusResponse } from './focusEvaluator';
import { calculateNextFocusDifficulty } from './focusDifficulty';

export class FocusEngine {
  constructor({
    mode = FOCUS_MODES.TARGET_SEARCH,
    sessionType = SESSION_TYPES.QUICK,
    initialDifficulty = FOCUS_DIFFICULTY_PARAMS.initialLevel,
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
        ? FOCUS_DIFFICULTY_PARAMS.quickRounds
        : sessionType === SESSION_TYPES.STANDARD
        ? FOCUS_DIFFICULTY_PARAMS.standardRounds
        : null; // null for ENDLESS
  }

  /**
   * Starts and returns the next dynamic task.
   */
  startNextTask() {
    this.roundNumber += 1;
    this.currentTask = generateFocusTask({
      mode: this.mode,
      difficultyLevel: this.currentLevel,
      roundNumber: this.roundNumber,
    });
    return this.currentTask;
  }

  /**
   * Submits user response for the active task.
   *
   * @param {any} userResponse - Selected index or boolean
   * @param {number} responseTimeMs - Elapsed response time
   * @returns {Object} { evaluation, nextDifficulty, isSessionFinished, sessionSummary }
   */
  submitResponse(userResponse, responseTimeMs) {
    if (!this.currentTask) {
      throw new Error('No active task to evaluate.');
    }

    const evaluation = evaluateFocusResponse({
      task: this.currentTask,
      userResponse,
      responseTimeMs,
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
    const nextDiff = calculateNextFocusDifficulty({
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
   * Times out the active task if response deadline expired.
   */
  handleTimeout() {
    return this.submitResponse(null, this.currentTask?.responseDeadlineMs || 2000);
  }

  /**
   * Produces aggregated session summary telemetry.
   */
  getSessionSummary() {
    const totalRounds = this.sessionHistory.length;
    if (totalRounds === 0) {
      return {
        gameType: 'focus',
        mode: this.mode,
        totalRounds: 0,
        correctCount: 0,
        incorrectCount: 0,
        missedCount: 0,
        falsePositiveCount: 0,
        averageAccuracy: 0,
        averageResponseTimeMs: 0,
        bestCombo: 0,
        totalScore: 0,
        difficultyReached: this.currentLevel,
        peakLevel: this.peakLevelReached,
      };
    }

    const correctCount = this.sessionHistory.filter((e) => e.isCorrect).length;
    const missedCount = this.sessionHistory.filter((e) => e.isMissed).length;
    const falsePositiveCount = this.sessionHistory.filter((e) => e.isFalsePositive).length;
    const incorrectCount = totalRounds - correctCount;

    const averageAccuracy = Math.round((correctCount / totalRounds) * 100);
    const validTimes = this.sessionHistory
      .filter((e) => !e.isMissed)
      .map((e) => e.responseTimeMs);

    const averageResponseTimeMs =
      validTimes.length > 0
        ? Math.round(validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length)
        : (this.sessionHistory.reduce((sum, e) => sum + e.responseTimeMs, 0) / totalRounds);

    return {
      gameType: 'focus',
      mode: this.mode,
      totalRounds,
      correctCount,
      incorrectCount,
      missedCount,
      falsePositiveCount,
      averageAccuracy,
      averageResponseTimeMs,
      bestCombo: this.bestCombo,
      totalScore: this.totalScore,
      difficultyReached: this.currentLevel,
      peakLevel: this.peakLevelReached,
    };
  }
}

export default FocusEngine;
