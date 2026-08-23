/**
 * OVERLOAD - Reaction Adaptive Difficulty Manager
 * Deterministic rolling-window performance progression for reaction speed.
 */

import { REACTION_DIFFICULTY_PARAMS } from './reactionConstants.js';

/**
 * Calculates next reaction difficulty level based on rolling performance metrics.
 *
 * @param {Object} params
 * @param {number} params.currentLevel - Current difficulty level (1 to 10)
 * @param {Array<Object>} params.recentEvaluations - History of recent round evaluations
 * @param {number} params.consecutiveCorrect - Streak of consecutive valid fast hits
 * @param {number} params.consecutiveErrors - Consecutive wrong taps/timeouts
 * @param {number} params.consecutiveFalseStarts - Consecutive early taps
 * @returns {Object} { nextLevel, reason }
 */
export function calculateNextReactionDifficulty({
  currentLevel = REACTION_DIFFICULTY_PARAMS.initialLevel,
  recentEvaluations = [],
  consecutiveCorrect = 0,
  consecutiveErrors = 0,
  consecutiveFalseStarts = 0,
} = {}) {
  const minLevel = REACTION_DIFFICULTY_PARAMS.minLevel;
  const maxLevel = REACTION_DIFFICULTY_PARAMS.maxLevel;

  // Immediate drop on multiple errors or repeated false starts
  if ((consecutiveErrors >= 2 || consecutiveFalseStarts >= 2) && currentLevel > minLevel) {
    return {
      nextLevel: currentLevel - 1,
      reason: 'consecutive_penalties',
    };
  }

  // Fast progression if 4 consecutive fast valid responses
  if (consecutiveCorrect >= 4 && currentLevel < maxLevel) {
    return {
      nextLevel: currentLevel + 1,
      reason: 'fast_consecutive_streak',
    };
  }

  // Rolling window analysis (last 5 evaluations)
  if (recentEvaluations.length >= 5) {
    const window = recentEvaluations.slice(-5);
    const correctCount = window.filter((ev) => ev.isCorrect).length;
    const accuracyPercent = (correctCount / window.length) * 100;
    const falseStartCount = window.filter((ev) => ev.isFalseStart).length;

    // Fast reaction with high accuracy -> level up
    if (accuracyPercent >= 80 && falseStartCount === 0 && currentLevel < maxLevel) {
      const validResponses = window.filter((ev) => ev.isCorrect && ev.responseTimeMs > 0);
      if (validResponses.length > 0) {
        const avgLatency = validResponses.reduce((sum, ev) => sum + ev.responseTimeMs, 0) / validResponses.length;
        if (avgLatency <= 380) {
          return {
            nextLevel: currentLevel + 1,
            reason: 'low_latency_mastery',
          };
        }
      }
    }

    // High error rate or high false start rate -> step down
    if ((accuracyPercent < 60 || falseStartCount >= 2) && currentLevel > minLevel) {
      return {
        nextLevel: currentLevel - 1,
        reason: 'high_latency_decay',
      };
    }
  }

  return {
    nextLevel: currentLevel,
    reason: 'maintained',
  };
}

export default {
  calculateNextReactionDifficulty,
};
