/**
 * OVERLOAD - Logic & Reasoning Adaptive Difficulty Manager
 * Deterministic rolling-window performance progression for Logic & Reasoning.
 */

import { LOGIC_DIFFICULTY_PARAMS } from './logicConstants.js';

/**
 * Calculates the next difficulty level based on rolling performance metrics.
 *
 * @param {Object} params
 * @param {number} params.currentLevel - Current difficulty level (1 to 10)
 * @param {Array<Object>} params.recentEvaluations - History of recent round evaluations
 * @param {number} params.consecutiveCorrect - Streak of consecutive correct decisions
 * @param {number} params.consecutiveErrors - Consecutive wrong choices/timeouts
 * @returns {Object} { nextLevel, reason }
 */
export function calculateNextLogicDifficulty({
  currentLevel = LOGIC_DIFFICULTY_PARAMS.initialLevel,
  recentEvaluations = [],
  consecutiveCorrect = 0,
  consecutiveErrors = 0,
} = {}) {
  const minLevel = LOGIC_DIFFICULTY_PARAMS.minLevel;
  const maxLevel = LOGIC_DIFFICULTY_PARAMS.maxLevel;

  // 1. Immediate step-down on 2 consecutive errors
  if (consecutiveErrors >= 2 && currentLevel > minLevel) {
    return {
      nextLevel: currentLevel - 1,
      reason: 'consecutive_errors',
    };
  }

  // 2. Fast progression if 4 consecutive correct answers
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
      return {
        nextLevel: currentLevel + 1,
        reason: 'logic_mastery',
      };
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
  calculateNextLogicDifficulty,
};
