/**
 * OVERLOAD - Cognitive Flexibility Response Evaluator Router
 * Pure evaluation function delegating to mode evaluators and applying scoring formulas.
 */

import { FLEXIBILITY_MODES } from './flexibilityConstants.js';
import { evaluateSortShiftResponse } from './sortShift/sortShiftEvaluator.js';
import { evaluatePatternShiftResponse } from './patternShift/patternShiftEvaluator.js';
import { evaluateDualRuleResponse } from './dualRule/dualRuleEvaluator.js';
import { calculateFlexibilityScore } from './flexibilityScoring.js';

/**
 * Evaluates a flexibility response across Sort Shift, Pattern Shift, or Dual Rule.
 *
 * @param {Object} params
 * @param {Object} params.task - The active task object
 * @param {string} params.userResponse - Selected option ID
 * @param {number} params.responseTimeMs - Milliseconds elapsed
 * @param {boolean} params.isTimedOut - True if timeout expired
 * @param {number} params.currentCombo - Consecutive correct rounds
 * @returns {Object} Structured evaluation result with score and telemetry
 */
export function evaluateFlexibilityResponse({
  task,
  userResponse = null,
  responseTimeMs = 0,
  isTimedOut = false,
  currentCombo = 0,
}) {
  if (!task) {
    throw new Error('Task object is required for flexibility evaluation.');
  }

  const mode = task.mode || FLEXIBILITY_MODES.SORT_SHIFT;
  const timeoutWindowMs = task.timeoutWindowMs || 6000;
  const difficultyLevel = task.difficultyLevel || 1;

  let rawEvaluation = null;

  switch (mode) {
    case FLEXIBILITY_MODES.SORT_SHIFT:
      rawEvaluation = evaluateSortShiftResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case FLEXIBILITY_MODES.PATTERN_SHIFT:
      rawEvaluation = evaluatePatternShiftResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case FLEXIBILITY_MODES.DUAL_RULE:
      rawEvaluation = evaluateDualRuleResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    default:
      rawEvaluation = evaluateSortShiftResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;
  }

  const isCorrect = Boolean(rawEvaluation.isCorrect);
  const nextCombo = isCorrect ? currentCombo + 1 : 0;

  const scoreResult = calculateFlexibilityScore({
    evaluation: rawEvaluation,
    timeoutWindowMs,
    difficultyLevel,
    currentCombo: isCorrect ? nextCombo : currentCombo,
  });

  return {
    ...rawEvaluation,
    pointsAwarded: scoreResult.pointsAwarded,
    penaltyPoints: scoreResult.penaltyPoints,
    combo: nextCombo,
    comboMultiplier: scoreResult.comboMultiplier,
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateFlexibilityResponse,
};
