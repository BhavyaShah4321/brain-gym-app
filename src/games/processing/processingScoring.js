/**
 * OVERLOAD - Processing Speed Scoring Engine
 * Deterministic scoring formulas for information throughput, accuracy, and latency.
 */

import { getProcessingComboMultiplier } from './processingConstants.js';

/**
 * Calculates deterministic points awarded or deducted for a processing speed evaluation.
 *
 * @param {Object} params
 * @param {Object} params.evaluation - The mode-specific raw evaluation
 * @param {number} params.timeoutWindowMs - Active timeout limit for the round
 * @param {number} params.difficultyLevel - Current difficulty tier (1 to 10)
 * @param {number} params.currentCombo - Consecutive correct responses
 * @returns {Object} { pointsAwarded, penaltyPoints, comboMultiplier, totalRoundScore }
 */
export function calculateProcessingScore({
  evaluation,
  timeoutWindowMs = 4000,
  difficultyLevel = 1,
  currentCombo = 0,
}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const diffMultiplier = 1 + (level - 1) * 0.1;
  const comboMultiplier = getProcessingComboMultiplier(currentCombo);

  // 1. Timeout Penalty
  if (evaluation.isTimedOut) {
    return {
      pointsAwarded: 0,
      penaltyPoints: 30,
      comboMultiplier: 1.0,
      totalRoundScore: 0,
    };
  }

  // 2. Incorrect Response Penalty
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
  const speedBonus = Math.max(0, Math.round((timeoutWindowMs - Math.min(latency, timeoutWindowMs)) / 12));

  let throughputBonus = 0;
  if (latency < 1000) {
    throughputBonus = 50;
  } else if (latency < 1600) {
    throughputBonus = 30;
  } else if (latency < 2200) {
    throughputBonus = 15;
  }

  const rawRoundPoints = Math.round(
    (basePoints + speedBonus + throughputBonus) * diffMultiplier * comboMultiplier
  );

  return {
    pointsAwarded: rawRoundPoints,
    penaltyPoints: 0,
    comboMultiplier,
    totalRoundScore: rawRoundPoints,
  };
}

export default {
  calculateProcessingScore,
};
