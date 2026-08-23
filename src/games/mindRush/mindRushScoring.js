/**
 * OVERLOAD - Mind Rush Scoring Engine
 * High-octane arcade scoring with combo multipliers and combat bonuses.
 */

import { getMindRushComboMultiplier } from './mindRushConstants.js';

/**
 * Calculates deterministic points awarded or deducted for a Mind Rush round.
 *
 * @param {Object} params
 * @param {Object} params.evaluation - The mode-specific raw evaluation
 * @param {number} params.timeoutWindowMs - Active timeout limit for the round
 * @param {number} params.difficultyLevel - Current difficulty tier (1 to 10)
 * @param {number} params.currentCombo - Consecutive correct hits
 * @returns {Object} { pointsAwarded, penaltyPoints, comboMultiplier, totalRoundScore }
 */
export function calculateMindRushScore({
  evaluation,
  timeoutWindowMs = 8000,
  difficultyLevel = 1,
  currentCombo = 0,
}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const diffMultiplier = 1 + (level - 1) * 0.15;
  const comboMultiplier = getMindRushComboMultiplier(currentCombo);

  // 1. Timeout Penalty
  if (evaluation.isTimedOut) {
    return {
      pointsAwarded: 0,
      penaltyPoints: 40,
      comboMultiplier: 1.0,
      totalRoundScore: 0,
    };
  }

  // 2. Incorrect Attack Penalty
  if (!evaluation.isCorrect) {
    return {
      pointsAwarded: 0,
      penaltyPoints: 45,
      comboMultiplier: 1.0,
      totalRoundScore: 0,
    };
  }

  // 3. Valid Detonation / Strike Scoring
  const basePoints = 150;
  const latency = evaluation.responseTimeMs || timeoutWindowMs;
  const speedBonus = Math.max(
    0,
    Math.round((timeoutWindowMs - Math.min(latency, timeoutWindowMs)) / 12)
  );

  let comboBonus = 0;
  if (currentCombo >= 10) {
    comboBonus = 100;
  } else if (currentCombo >= 5) {
    comboBonus = 50;
  }

  const rawRoundPoints = Math.round(
    (basePoints + speedBonus + comboBonus) * diffMultiplier * comboMultiplier
  );

  return {
    pointsAwarded: rawRoundPoints,
    penaltyPoints: 0,
    comboMultiplier,
    totalRoundScore: rawRoundPoints,
  };
}

export default {
  calculateMindRushScore,
};
