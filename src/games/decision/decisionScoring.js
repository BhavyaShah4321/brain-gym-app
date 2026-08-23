/**
 * OVERLOAD - Decision Making Scoring Engine
 * Deterministic scoring formulas and multi-criteria prioritization algorithm.
 *
 * =========================================================================
 * PRIORITY EVALUATION ALGORITHM (Priority Sort)
 * =========================================================================
 * Priority Score is computed across five deterministic dimensions:
 * 1. Importance (w = 35): CRITICAL (140), HIGH (105), MEDIUM (70), LOW (35)
 * 2. Urgency (w = 30): IMMEDIATE (120), HIGH (90), MEDIUM (60), LOW (30)
 * 3. Deadline (w = 25): <=15m (100), 20-30m (85-95), 45m-1h (70-75), 3h (50), Tomorrow (25), None (10)
 * 4. Impact (w = 20): CRITICAL (80), HIGH (60), MEDIUM (40), LOW (20)
 * 5. Blocking Dependency (w = 15): true (+45), false (0)
 *
 * Score = ImportanceScore + UrgencyScore + DeadlineScore + ImpactScore + BlockScore
 * The scenario is certified valid only when exactly one task achieves the maximum score.
 * =========================================================================
 */

import { getDecisionComboMultiplier, DECISION_MODES } from './decisionConstants.js';

/**
 * Calculates deterministic points awarded or deducted for a decision evaluation.
 *
 * @param {Object} params
 * @param {Object} params.evaluation - The mode-specific raw evaluation
 * @param {number} params.timeoutWindowMs - Active timeout limit for the round
 * @param {number} params.difficultyLevel - Current difficulty tier (1 to 10)
 * @param {number} params.currentCombo - Consecutive rational/correct decisions
 * @returns {Object} { pointsAwarded, penaltyPoints, comboMultiplier, totalRoundScore }
 */
export function calculateDecisionScore({
  evaluation,
  timeoutWindowMs = 6000,
  difficultyLevel = 1,
  currentCombo = 0,
}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const diffMultiplier = 1 + (level - 1) * 0.1;
  const comboMultiplier = getDecisionComboMultiplier(currentCombo);

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

  let decisionQualityBonus = 0;
  if (latency < 1600) {
    decisionQualityBonus = 40;
  } else if (latency < 2500) {
    decisionQualityBonus = 20;
  }

  const rawRoundPoints = Math.round(
    (basePoints + speedBonus + decisionQualityBonus) * diffMultiplier * comboMultiplier
  );

  return {
    pointsAwarded: rawRoundPoints,
    penaltyPoints: 0,
    comboMultiplier,
    totalRoundScore: rawRoundPoints,
  };
}

export default {
  calculateDecisionScore,
};
