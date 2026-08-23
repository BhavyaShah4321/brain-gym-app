/**
 * OVERLOAD - Mind Rush Adaptive Difficulty Manager
 * Deterministic rolling-window performance progression for Mind Rush Arcade.
 */

import { MIND_RUSH_DIFFICULTY_PARAMS } from './mindRushConstants.js';

/**
 * Calculates the next difficulty level based on rolling combat performance.
 *
 * @param {Object} params
 * @param {number} params.currentLevel - Current difficulty level (1 to 10)
 * @param {Array<Object>} params.recentEvaluations - History of recent round evaluations
 * @param {number} params.consecutiveCorrect - Streak of consecutive hits
 * @param {number} params.consecutiveErrors - Consecutive misses/timeouts
 * @returns {Object} { nextLevel, reason }
 */
export function calculateNextMindRushDifficulty({
  currentLevel = MIND_RUSH_DIFFICULTY_PARAMS.initialLevel,
  recentEvaluations = [],
  consecutiveCorrect = 0,
  consecutiveErrors = 0,
} = {}) {
  const minLevel = MIND_RUSH_DIFFICULTY_PARAMS.minLevel;
  const maxLevel = MIND_RUSH_DIFFICULTY_PARAMS.maxLevel;

  // 1. Step-down on 2 consecutive misses
  if (consecutiveErrors >= 2 && currentLevel > minLevel) {
    return {
      nextLevel: currentLevel - 1,
      reason: 'consecutive_misses',
    };
  }

  // 2. Fast progression if 4 consecutive hits
  if (consecutiveCorrect >= 4 && currentLevel < maxLevel) {
    return {
      nextLevel: currentLevel + 1,
      reason: 'combat_killstreak',
    };
  }

  // 3. Rolling window analysis (last 5 rounds)
  if (recentEvaluations.length >= 5) {
    const window = recentEvaluations.slice(-5);
    const correctCount = window.filter((ev) => ev.isCorrect).length;
    const accuracyPercent = (correctCount / window.length) * 100;

    if (accuracyPercent >= 80 && currentLevel < maxLevel) {
      return {
        nextLevel: currentLevel + 1,
        reason: 'arcade_mastery',
      };
    }

    if (accuracyPercent < 60 && currentLevel > minLevel) {
      return {
        nextLevel: currentLevel - 1,
        reason: 'damage_decay',
      };
    }
  }

  return {
    nextLevel: currentLevel,
    reason: 'maintained',
  };
}

export default {
  calculateNextMindRushDifficulty,
};
