/**
 * OVERLOAD - Cognitive Flexibility Scoring Engine
 * Deterministic scoring formulas for rule switching, transition detection, and speed.
 */

import { getFlexibilityComboMultiplier } from './flexibilityConstants.js';

/**
 * Calculates deterministic points awarded or deducted for a flexibility evaluation.
 *
 * @param {Object} params
 * @param {Object} params.evaluation - The mode-specific raw evaluation
 * @param {number} params.timeoutWindowMs - Active timeout limit for the round
 * @param {number} params.difficultyLevel - Current difficulty tier (1 to 10)
 * @param {number} params.currentCombo - Consecutive rational/correct decisions
 * @returns {Object} { pointsAwarded, penaltyPoints, comboMultiplier, totalRoundScore }
 */
export function calculateFlexibilityScore({
  evaluation,
  timeoutWindowMs = 6000,
  difficultyLevel = 1,
  currentCombo = 0,
}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const diffMultiplier = 1 + (level - 1) * 0.1;
  const comboMultiplier = getFlexibilityComboMultiplier(currentCombo);

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

  let switchBonus = 0;
  if (evaluation.isRuleShiftTrial) {
    switchBonus = 40; // Special reward for correct decision immediately on a rule shift!
  } else if (latency < 1600) {
    switchBonus = 20;
  }

  const rawRoundPoints = Math.round(
    (basePoints + speedBonus + switchBonus) * diffMultiplier * comboMultiplier
  );

  return {
    pointsAwarded: rawRoundPoints,
    penaltyPoints: 0,
    comboMultiplier,
    totalRoundScore: rawRoundPoints,
  };
}

export default {
  calculateFlexibilityScore,
};
