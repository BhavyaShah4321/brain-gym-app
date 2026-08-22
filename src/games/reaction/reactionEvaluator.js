/**
 * OVERLOAD - Reaction Response Evaluator Router
 * Pure evaluation function delegating to mode evaluators and applying scoring formulas.
 */

import { REACTION_MODES } from './reactionConstants';
import { evaluateTargetTapResponse } from './targetTap/targetTapEvaluator';
import { evaluateRapidChoiceResponse } from './rapidChoice/rapidChoiceEvaluator';
import { evaluateDirectionReactionResponse } from './directionReaction/directionReactionEvaluator';
import { calculateReactionScore } from './reactionScoring';

/**
 * Evaluates a reaction response across Target Tap, Rapid Choice, or Direction Reaction.
 *
 * @param {Object} params
 * @param {Object} params.task - The active task object
 * @param {any} params.userResponse - Choice index, direction id, or null
 * @param {number} params.responseTimeMs - Milliseconds elapsed from stimulus onset to response
 * @param {boolean} params.isFalseStart - True if user responded before stimulus onset
 * @param {boolean} params.isTimedOut - True if response timeout expired
 * @param {number} params.currentCombo - Consecutive valid fast responses
 * @returns {Object} Structured evaluation result with score and telemetry
 */
export function evaluateReactionResponse({
  task,
  userResponse = null,
  responseTimeMs = 0,
  isFalseStart = false,
  isTimedOut = false,
  currentCombo = 0,
}) {
  if (!task) {
    throw new Error('Task object is required for evaluation.');
  }

  const mode = task.mode || REACTION_MODES.TARGET_TAP;
  const timeoutWindowMs = task.timeoutWindowMs || 2000;
  const difficultyLevel = task.difficultyLevel || 1;

  let rawEvaluation = null;

  switch (mode) {
    case REACTION_MODES.TARGET_TAP:
      rawEvaluation = evaluateTargetTapResponse({
        task,
        responseTimeMs,
        isFalseStart,
        isTimedOut,
        currentCombo,
      });
      break;

    case REACTION_MODES.RAPID_CHOICE:
      rawEvaluation = evaluateRapidChoiceResponse({
        task,
        userChoiceIndex: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case REACTION_MODES.DIRECTION_REACTION:
      rawEvaluation = evaluateDirectionReactionResponse({
        task,
        userDirectionId: userResponse,
        responseTimeMs,
        isFalseStart,
        isTimedOut,
      });
      break;

    default:
      rawEvaluation = evaluateTargetTapResponse({
        task,
        responseTimeMs,
        isFalseStart,
        isTimedOut,
        currentCombo,
      });
      break;
  }

  // Calculate combo and scoring
  const isCorrect = Boolean(rawEvaluation.isCorrect);
  const nextCombo = isCorrect ? currentCombo + 1 : 0;

  const scoreResult = calculateReactionScore({
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
  evaluateReactionResponse,
};
