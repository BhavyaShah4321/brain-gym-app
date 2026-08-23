/**
 * OVERLOAD - Spatial Response Evaluator Router
 * Pure evaluation function delegating to mode evaluators and applying scoring formulas.
 */

import { SPATIAL_MODES } from './spatialConstants.js';
import { evaluateMentalRotationResponse } from './mentalRotation/mentalRotationEvaluator.js';
import { evaluateSpatialNavigationResponse } from './spatialNavigation/spatialNavigationEvaluator.js';
import { evaluateMirrorMapResponse } from './mirrorMap/mirrorMapEvaluator.js';
import { calculateSpatialScore } from './spatialScoring.js';

/**
 * Evaluates a spatial response across Mental Rotation, Spatial Navigation, or Mirror Map.
 *
 * @param {Object} params
 * @param {Object} params.task - The active task object
 * @param {*} params.userResponse - Selected option ID / cell index / playerPath array
 * @param {number} params.responseTimeMs - Milliseconds elapsed
 * @param {boolean} params.isTimedOut - True if timeout expired
 * @param {number} params.currentCombo - Consecutive correct rounds
 * @returns {Object} Structured evaluation result with score and telemetry
 */
export function evaluateSpatialResponse({
  task,
  userResponse = null,
  responseTimeMs = 0,
  isTimedOut = false,
  currentCombo = 0,
}) {
  if (!task) {
    throw new Error('Task object is required for spatial evaluation.');
  }

  const mode = task.mode || SPATIAL_MODES.MENTAL_ROTATION;
  const timeoutWindowMs = task.timeoutWindowMs || 7500;
  const difficultyLevel = task.difficultyLevel || 1;

  let rawEvaluation = null;

  switch (mode) {
    case SPATIAL_MODES.MENTAL_ROTATION:
      rawEvaluation = evaluateMentalRotationResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case SPATIAL_MODES.SPATIAL_NAVIGATION:
      rawEvaluation = evaluateSpatialNavigationResponse({
        task,
        playerPath: Array.isArray(userResponse) ? userResponse : [],
        responseTimeMs,
        isTimedOut,
      });
      break;

    case SPATIAL_MODES.MIRROR_MAP:
      rawEvaluation = evaluateMirrorMapResponse({
        task,
        selectedCellIndex: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    default:
      rawEvaluation = evaluateMentalRotationResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;
  }

  const isCorrect = Boolean(rawEvaluation.isCorrect);
  const nextCombo = isCorrect ? currentCombo + 1 : 0;

  const scoreResult = calculateSpatialScore({
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
  evaluateSpatialResponse,
};
