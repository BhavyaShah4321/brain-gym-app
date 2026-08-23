/**
 * OVERLOAD - Decision Response Evaluator Router
 * Pure evaluation function delegating to mode evaluators and applying scoring formulas.
 */

import { DECISION_MODES } from './decisionConstants.js';
import { evaluatePrioritySortResponse } from './prioritySort/prioritySortEvaluator.js';
import { evaluateBestChoiceResponse } from './bestChoice/bestChoiceEvaluator.js';
import { evaluateRuleSwitchResponse } from './ruleSwitch/ruleSwitchEvaluator.js';
import { calculateDecisionScore } from './decisionScoring.js';

/**
 * Evaluates a decision response across Priority Sort, Best Choice, or Rule Switch.
 *
 * @param {Object} params
 * @param {Object} params.task - The active task object
 * @param {string} params.userResponse - Selected option/task ID
 * @param {number} params.responseTimeMs - Milliseconds elapsed to make decision
 * @param {boolean} params.isTimedOut - True if decision timeout window expired
 * @param {number} params.currentCombo - Consecutive rational/correct decisions
 * @returns {Object} Structured evaluation result with score and telemetry
 */
export function evaluateDecisionResponse({
  task,
  userResponse = null,
  responseTimeMs = 0,
  isTimedOut = false,
  currentCombo = 0,
}) {
  if (!task) {
    throw new Error('Task object is required for evaluation.');
  }

  const mode = task.mode || DECISION_MODES.PRIORITY_SORT;
  const timeoutWindowMs = task.timeoutWindowMs || 6000;
  const difficultyLevel = task.difficultyLevel || 1;

  let rawEvaluation = null;

  switch (mode) {
    case DECISION_MODES.PRIORITY_SORT:
      rawEvaluation = evaluatePrioritySortResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case DECISION_MODES.BEST_CHOICE:
      rawEvaluation = evaluateBestChoiceResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case DECISION_MODES.RULE_SWITCH:
      rawEvaluation = evaluateRuleSwitchResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    default:
      rawEvaluation = evaluatePrioritySortResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;
  }

  const isCorrect = Boolean(rawEvaluation.isCorrect);
  const nextCombo = isCorrect ? currentCombo + 1 : 0;

  const scoreResult = calculateDecisionScore({
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
  evaluateDecisionResponse,
};
