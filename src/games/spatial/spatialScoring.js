/**
 * OVERLOAD - Spatial Reasoning Scoring Engine
 * Deterministic scoring formulas for spatial transformations, sequence accuracy, and latency.
 */

import { getSpatialComboMultiplier } from './spatialConstants.js';

/**
 * Calculates deterministic points awarded or deducted for a spatial evaluation.
 *
 * @param {Object} params
 * @param {Object} params.evaluation - The mode-specific raw evaluation
 * @param {number} params.timeoutWindowMs - Active timeout limit for the round
 * @param {number} params.difficultyLevel - Current difficulty tier (1 to 10)
 * @param {number} params.currentCombo - Consecutive rational/correct decisions
 * @returns {Object} { pointsAwarded, penaltyPoints, comboMultiplier, totalRoundScore }
 */
export function calculateSpatialScore({
  evaluation,
  timeoutWindowMs = 7500,
  difficultyLevel = 1,
  currentCombo = 0,
}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const diffMultiplier = 1 + (level - 1) * 0.1;
  const comboMultiplier = getSpatialComboMultiplier(currentCombo);

  // 1. Timeout Penalty
  if (evaluation.isTimedOut) {
    return {
      pointsAwarded: 0,
      penaltyPoints: 30,
      comboMultiplier: 1.0,
      totalRoundScore: 0,
    };
  }

  // 2. Incorrect Decision Penalty
  if (!evaluation.isCorrect) {
    return {
      pointsAwarded: 0,
      penaltyPoints: 35,
      comboMultiplier: 1.0,
      totalRoundScore: 0,
    };
  }

  // 3. Valid Correct Decision Scoring
  const basePoints = 100;
  const latency = evaluation.responseTimeMs || timeoutWindowMs;
  const speedBonus = Math.max(0, Math.round((timeoutWindowMs - Math.min(latency, timeoutWindowMs)) / 15));

  let precisionBonus = 0;
  if (latency < 1800) {
    precisionBonus = 35;
  } else if (latency < 2800) {
    precisionBonus = 20;
  }

  const rawRoundPoints = Math.round(
    (basePoints + speedBonus + precisionBonus) * diffMultiplier * comboMultiplier
  );

  return {
    pointsAwarded: rawRoundPoints,
    penaltyPoints: 0,
    comboMultiplier,
    totalRoundScore: rawRoundPoints,
  };
}

export default {
  calculateSpatialScore,
};
