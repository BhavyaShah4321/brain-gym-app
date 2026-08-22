/**
 * OVERLOAD - Focus Adaptive Difficulty Manager
 * Deterministic rolling-window performance difficulty adaptation.
 */

import { FOCUS_DIFFICULTY_PARAMS } from './focusConstants';

/**
 * Calculates the next difficulty level based on recent performance window.
 *
 * @param {Object} params
 * @param {number} params.currentLevel - 1 to 10
 * @param {Array<Object>} params.recentEvaluations - History of recent round evaluations
 * @param {number} params.consecutiveCorrect - Streak of consecutive correct answers
 * @param {number} params.consecutiveErrors - Streak of consecutive errors
 * @returns {Object} { nextLevel, reason }
 */
export function calculateNextFocusDifficulty({
  currentLevel = FOCUS_DIFFICULTY_PARAMS.initialLevel,
  recentEvaluations = [],
  consecutiveCorrect = 0,
  consecutiveErrors = 0,
} = {}) {
  const minLevel = FOCUS_DIFFICULTY_PARAMS.minLevel;
  const maxLevel = FOCUS_DIFFICULTY_PARAMS.maxLevel;

  // Immediate drop on 2 consecutive errors
  if (consecutiveErrors >= 2 && currentLevel > minLevel) {
    return {
      nextLevel: currentLevel - 1,
      reason: 'consecutive_errors',
    };
  }

  // Fast progression if 4 consecutive fast correct responses
  if (consecutiveCorrect >= 4 && currentLevel < maxLevel) {
    return {
      nextLevel: currentLevel + 1,
      reason: 'consecutive_streak',
    };
  }

  // Rolling window analysis (last 5 evaluations)
  if (recentEvaluations.length >= 5) {
    const window = recentEvaluations.slice(-5);
    const correctCount = window.filter((ev) => ev.isCorrect).length;
    const accuracyPercent = (correctCount / window.length) * 100;

    // High accuracy + fast response -> level up
    if (accuracyPercent >= 80 && currentLevel < maxLevel) {
      const avgLatency = window.reduce((sum, ev) => sum + ev.responseTimeMs, 0) / window.length;
      const avgDeadline = window.reduce((sum, ev) => sum + ev.responseDeadlineMs, 0) / window.length;

      if (avgLatency < avgDeadline * 0.8) {
        return {
          nextLevel: currentLevel + 1,
          reason: 'high_accuracy_fast_speed',
        };
      }
    }

    // Poor accuracy -> step down
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
  calculateNextFocusDifficulty,
};
