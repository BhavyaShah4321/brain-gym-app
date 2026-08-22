/**
 * OVERLOAD - Memory Adaptive Difficulty Manager
 * Deterministic rolling-window performance progression for Working Memory.
 */

import { DEFAULT_DIFFICULTY_PARAMS } from './memoryConstants';

/**
 * Calculates the next difficulty span based on streak and rolling performance window.
 *
 * @param {Object} params
 * @param {number} params.currentSpan - Active difficulty span (2 to 9)
 * @param {number} params.streak - Consecutive perfect rounds
 * @param {Array<Object>} params.recentEvaluations - History of recent round evaluations
 * @returns {Object} { nextSpan, streak, reason }
 */
export function calculateNextDifficulty({
  currentSpan = DEFAULT_DIFFICULTY_PARAMS.initialSpan,
  streak = 0,
  recentEvaluations = [],
} = {}) {
  const minSpan = DEFAULT_DIFFICULTY_PARAMS.minSpan;
  const maxSpan = DEFAULT_DIFFICULTY_PARAMS.maxSpan;

  // 1. Streak progression: 2 consecutive perfect rounds at current span -> increase span
  if (streak >= 2 && currentSpan < maxSpan) {
    return {
      nextSpan: currentSpan + 1,
      streak: 0,
      reason: 'increased_span_streak',
    };
  }

  // 2. Immediate decay: 2 consecutive failed rounds -> decrease span
  if (recentEvaluations.length >= 2) {
    const lastTwo = recentEvaluations.slice(-2);
    const bothFailed = lastTwo.every((ev) => !ev.isPerfect && ev.accuracy < 60);
    if (bothFailed && currentSpan > minSpan) {
      return {
        nextSpan: currentSpan - 1,
        streak: 0,
        reason: 'decreased_span_consecutive_failures',
      };
    }
  }

  // 3. Rolling window analysis (last 5 rounds)
  if (recentEvaluations.length >= 5) {
    const window = recentEvaluations.slice(-5);
    const avgAcc = window.reduce((sum, ev) => sum + ev.accuracy, 0) / window.length;

    if (avgAcc >= 85 && currentSpan < maxSpan) {
      return {
        nextSpan: currentSpan + 1,
        streak: 0,
        reason: 'increased_span_rolling_accuracy',
      };
    }

    if (avgAcc < 50 && currentSpan > minSpan) {
      return {
        nextSpan: currentSpan - 1,
        streak: 0,
        reason: 'decreased_span_rolling_decay',
      };
    }
  }

  return {
    nextSpan: currentSpan,
    streak,
    reason: 'maintained',
  };
}

export default {
  calculateNextDifficulty,
};
