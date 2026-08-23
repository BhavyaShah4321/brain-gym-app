/**
 * OVERLOAD - Processing Speed Adaptive Difficulty Manager
 * Deterministic rolling-window performance progression for Processing Speed.
 */

import { PROCESSING_DIFFICULTY_PARAMS } from './processingConstants.js';

/**
 * Calculates the next difficulty level based on rolling performance metrics.
 *
 * @param {Object} params
 * @param {number} params.currentLevel - Current difficulty level (1 to 10)
 * @param {Array<Object>} params.recentEvaluations - History of recent round evaluations
 * @param {number} params.consecutiveCorrect - Streak of consecutive correct answers
 * @param {number} params.consecutiveErrors - Consecutive wrong choices/timeouts
 * @returns {Object} { nextLevel, reason }
 */
export function calculateNextProcessingDifficulty({
  currentLevel = PROCESSING_DIFFICULTY_PARAMS.initialLevel,
  recentEvaluations = [],
  consecutiveCorrect = 0,
  consecutiveErrors = 0,
} = {}) {
  const minLevel = PROCESSING_DIFFICULTY_PARAMS.minLevel;
  const maxLevel = PROCESSING_DIFFICULTY_PARAMS.maxLevel;

  // 1. Immediate step-down on 2 consecutive errors or timeouts
  if (consecutiveErrors >= 2 && currentLevel > minLevel) {
    return {
      nextLevel: currentLevel - 1,
      reason: 'consecutive_errors',
    };
  }

  // 2. Fast progression if 4 consecutive correct fast responses
  if (consecutiveCorrect >= 4 && currentLevel < maxLevel) {
    return {
      nextLevel: currentLevel + 1,
      reason: 'fast_consecutive_streak',
    };
  }

  // 3. Rolling window analysis (last 5 rounds)
  if (recentEvaluations.length >= 5) {
    const window = recentEvaluations.slice(-5);
    const correctCount = window.filter((ev) => ev.isCorrect).length;
    const accuracyPercent = (correctCount / window.length) * 100;

    if (accuracyPercent >= 80 && currentLevel < maxLevel) {
      const validResponses = window.filter((ev) => ev.isCorrect && ev.responseTimeMs > 0);
      if (validResponses.length > 0) {
        const avgTime = validResponses.reduce((sum, ev) => sum + ev.responseTimeMs, 0) / validResponses.length;
        if (avgTime <= 2200) {
          return {
            nextLevel: currentLevel + 1,
            reason: 'swift_processing_mastery',
          };
        }
      }
    }

    if (accuracyPercent < 60 && currentLevel > minLevel) {
      return {
        nextLevel: currentLevel - 1,
        reason: 'low_accuracy_decay',
      };
    }
  }

  return {
    nextLevel: currentLevel,
    reason: 'maintained',
  };
}

export default {
  calculateNextProcessingDifficulty,
};
