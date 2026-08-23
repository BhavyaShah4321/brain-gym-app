/**
 * OVERLOAD - Logic & Reasoning Scoring Engine
 * Deterministic scoring formulas for deductive accuracy, rule induction, and latency.
 */

import { getLogicComboMultiplier } from './logicConstants.js';

/**
 * Calculates deterministic points awarded or deducted for a logic evaluation.
 *
 * @param {Object} params
 * @param {Object} params.evaluation - The mode-specific raw evaluation
 * @param {number} params.timeoutWindowMs - Active timeout limit for the round
 * @param {number} params.difficultyLevel - Current difficulty tier (1 to 10)
 * @param {number} params.currentCombo - Consecutive correct decisions
 * @returns {Object} { pointsAwarded, penaltyPoints, comboMultiplier, totalRoundScore }
 */
export function calculateLogicScore({
  evaluation,
  timeoutWindowMs = 12000,
  difficultyLevel = 1,
  currentCombo = 0,
}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const diffMultiplier = 1 + (level - 1) * 0.1;
  const comboMultiplier = getLogicComboMultiplier(currentCombo);

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
  const speedBonus = Math.max(
    0,
    Math.round((timeoutWindowMs - Math.min(latency, timeoutWindowMs)) / 15)
  );

  let deductionBonus = 0;
  if (latency < 2200) {
    deductionBonus = 30; // High speed deductive reasoning
  } else if (latency < 3800) {
    deductionBonus = 15;
  }

  const rawRoundPoints = Math.round(
    (basePoints + speedBonus + deductionBonus) * diffMultiplier * comboMultiplier
  );

  return {
    pointsAwarded: rawRoundPoints,
    penaltyPoints: 0,
    comboMultiplier,
    totalRoundScore: rawRoundPoints,
  };
}

export default {
  calculateLogicScore,
};
