/**
 * OVERLOAD - Reaction Scoring Engine
 * Deterministic calculation of points, reflex bonuses, speed curves, and combo multipliers.
 */

import { getReactionComboMultiplier } from './reactionConstants.js';

/**
 * Calculates deterministic points awarded or deducted for a reaction evaluation.
 *
 * @param {Object} params
 * @param {Object} params.evaluation - The mode-specific raw evaluation
 * @param {number} params.timeoutWindowMs - Active timeout limit for the round
 * @param {number} params.difficultyLevel - Current difficulty tier (1 to 10)
 * @param {number} params.currentCombo - Consecutive valid fast responses
 * @returns {Object} { pointsAwarded, penaltyPoints, comboMultiplier, totalRoundScore }
 */
export function calculateReactionScore({
  evaluation,
  timeoutWindowMs = 2000,
  difficultyLevel = 1,
  currentCombo = 0,
}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const diffMultiplier = 1 + (level - 1) * 0.1;
  const comboMultiplier = getReactionComboMultiplier(currentCombo);

  // 1. False Start Penalty
  if (evaluation.isFalseStart) {
    return {
      pointsAwarded: 0,
      penaltyPoints: 50,
      comboMultiplier: 1.0,
      totalRoundScore: 0,
    };
  }

  // 2. Timeout Penalty
  if (evaluation.isTimedOut) {
    return {
      pointsAwarded: 0,
      penaltyPoints: 30,
      comboMultiplier: 1.0,
      totalRoundScore: 0,
    };
  }

  // 3. Wrong Target / Decision Penalty
  if (evaluation.isWrongChoice || !evaluation.isCorrect) {
    return {
      pointsAwarded: 0,
      penaltyPoints: 40,
      comboMultiplier: 1.0,
      totalRoundScore: 0,
    };
  }

  // 4. Valid Reaction Hit Scoring
  const basePoints = 100;
  const latency = evaluation.responseTimeMs || timeoutWindowMs;
  const speedBonus = Math.max(0, Math.round((timeoutWindowMs - Math.min(latency, timeoutWindowMs)) / 5));

  // High-performance reflex thresholds
  let apexBonus = 0;
  if (latency < 200) {
    apexBonus = 80;
  } else if (latency < 250) {
    apexBonus = 50;
  } else if (latency < 320) {
    apexBonus = 25;
  }

  const rawRoundPoints = Math.round((basePoints + speedBonus + apexBonus) * diffMultiplier * comboMultiplier);

  return {
    pointsAwarded: rawRoundPoints,
    penaltyPoints: 0,
    comboMultiplier,
    totalRoundScore: rawRoundPoints,
  };
}

export default {
  calculateReactionScore,
};
