/**
 * OVERLOAD - Memory Engine
 * Isolated game engine coordinating task generation, evaluation, combo tracking,
 * and adaptive difficulty for all 4 Working Memory games.
 * Zero UI / persistence coupling.
 */

import { generateMemoryTask } from './memoryGenerator';
import { evaluateMemoryResponse } from './memoryEvaluator';
import { calculateNextDifficulty } from './memoryDifficulty';
import { MEMORY_MODES, SESSION_TYPES, DEFAULT_DIFFICULTY_PARAMS } from './memoryConstants';

export class MemoryEngine {
  constructor({
    mode = MEMORY_MODES.SEQUENCE_RECALL,
    sessionType = SESSION_TYPES.QUICK,
    initialSpan = DEFAULT_DIFFICULTY_PARAMS.initialSpan,
  } = {}) {
    this.mode = mode;
    this.sessionType = sessionType;
    this.currentSpan = Math.max(2, Math.min(9, initialSpan));
    this.roundNumber = 0;

    this.streak = 0;
    this.bestCombo = 0;
    this.totalScore = 0;
    this.peakSpan = this.currentSpan;

    this.currentTask = null;
    this.sessionHistory = [];

    this.maxRounds =
      sessionType === SESSION_TYPES.QUICK
        ? DEFAULT_DIFFICULTY_PARAMS.quickRounds
        : sessionType === SESSION_TYPES.STANDARD
        ? DEFAULT_DIFFICULTY_PARAMS.standardRounds
        : null; // null for ENDLESS
  }

  /**
   * Generates and returns the next procedural task.
   */
  startNextTask() {
    this.roundNumber += 1;
    this.currentTask = generateMemoryTask({
      mode: this.mode,
      span: this.currentSpan,
      roundNumber: this.roundNumber,
    });
    return this.currentTask;
  }

  /**
   * Submits user response for evaluation and difficulty update.
   */
  submitResponse(userResponse, responseTimeMs = 0) {
    if (!this.currentTask) {
      throw new Error('No active task to evaluate.');
    }

    const evaluation = evaluateMemoryResponse({
      task: this.currentTask,
      userResponse,
      responseTimeMs,
      currentCombo: this.streak,
    });

    if (evaluation.isPerfect) {
      this.streak += 1;
      this.totalScore = Math.max(0, this.totalScore + evaluation.pointsAwarded);
      if (this.streak > this.bestCombo) {
        this.bestCombo = this.streak;
      }
    } else {
      this.streak = 0;
      this.totalScore = Math.max(0, this.totalScore + evaluation.pointsAwarded - evaluation.penaltyPoints);
    }

    this.sessionHistory.push(evaluation);

    // Calculate adaptive difficulty for subsequent task
    const diffResult = calculateNextDifficulty({
      currentSpan: this.currentSpan,
      streak: this.streak,
      recentEvaluations: this.sessionHistory,
    });

    this.currentSpan = diffResult.nextSpan;
    if (this.currentSpan > this.peakSpan) {
      this.peakSpan = this.currentSpan;
    }
    this.streak = diffResult.streak;

    const isSessionFinished = this.maxRounds !== null && this.roundNumber >= this.maxRounds;

    return {
      evaluation,
      nextDifficulty: diffResult,
      currentCombo: this.streak,
      bestCombo: this.bestCombo,
      totalScore: this.totalScore,
      isSessionFinished,
      sessionSummary: this.getSessionSummary(),
    };
  }

  /**
   * Produces aggregated session summary telemetry.
   */
  getSessionSummary() {
    const totalRounds = this.sessionHistory.length;
    if (totalRounds === 0) {
      return {
        gameType: 'memory',
        facultyId: 'memory',
        mode: this.mode,
        totalRounds: 0,
        correctCount: 0,
        averageAccuracy: 0,
        averageResponseTimeMs: 0,
        currentSpan: this.currentSpan,
        peakSpan: this.peakSpan,
        bestCombo: 0,
        totalScore: 0,
      };
    }

    const correctCount = this.sessionHistory.filter((h) => h.isPerfect).length;
    const totalAccuracy = this.sessionHistory.reduce((sum, h) => sum + h.accuracy, 0);
    const totalTime = this.sessionHistory.reduce((sum, h) => sum + h.responseTimeMs, 0);

    return {
      gameType: 'memory',
      facultyId: 'memory',
      mode: this.mode,
      totalRounds,
      correctCount,
      averageAccuracy: Math.round(totalAccuracy / totalRounds),
      averageResponseTimeMs: Math.round(totalTime / totalRounds),
      currentSpan: this.currentSpan,
      peakSpan: this.peakSpan,
      bestCombo: this.bestCombo,
      totalScore: this.totalScore,
    };
  }
}

export default MemoryEngine;
