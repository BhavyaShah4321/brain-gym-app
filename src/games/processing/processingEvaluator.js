/**
 * OVERLOAD - Processing Response Evaluator Router
 * Pure evaluation function delegating to mode evaluators and applying scoring formulas.
 */

import { PROCESSING_MODES } from './processingConstants.js';
import { evaluateSymbolMatchResponse } from './symbolMatch/symbolMatchEvaluator.js';
import { evaluateNumberScanResponse } from './numberScan/numberScanEvaluator.js';
import { evaluatePatternCompleteResponse } from './patternComplete/patternCompleteEvaluator.js';
import { calculateProcessingScore } from './processingScoring.js';

/**
 * Evaluates a processing speed response across Symbol Match, Number Scan, or Pattern Complete.
 *
 * @param {Object} params
 * @param {Object} params.task - The active task object
 * @param {any} params.userResponse - Choice string, index, or array of indices
 * @param {number} params.responseTimeMs - Milliseconds elapsed to complete processing
 * @param {boolean} params.isTimedOut - True if round timeout expired
 * @param {number} params.currentCombo - Consecutive correct rounds
 * @returns {Object} Structured evaluation result with score and telemetry
 */
export function evaluateProcessingResponse({
  task,
  userResponse = null,
  responseTimeMs = 0,
  isTimedOut = false,
  currentCombo = 0,
}) {
  if (!task) {
    throw new Error('Task object is required for evaluation.');
  }

  const mode = task.mode || PROCESSING_MODES.SYMBOL_MATCH;
  const timeoutWindowMs = task.timeoutWindowMs || 4000;
  const difficultyLevel = task.difficultyLevel || 1;

  let rawEvaluation = null;

  switch (mode) {
    case PROCESSING_MODES.SYMBOL_MATCH:
      rawEvaluation = evaluateSymbolMatchResponse({
        task,
        userChoice: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case PROCESSING_MODES.NUMBER_SCAN:
      rawEvaluation = evaluateNumberScanResponse({
        task,
        userSelectedIndices: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case PROCESSING_MODES.PATTERN_COMPLETE:
      rawEvaluation = evaluatePatternCompleteResponse({
        task,
        userChoiceIndex: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    default:
      rawEvaluation = evaluateSymbolMatchResponse({
        task,
        userChoice: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;
  }

  const isCorrect = Boolean(rawEvaluation.isCorrect);
  const nextCombo = isCorrect ? currentCombo + 1 : 0;

  const scoreResult = calculateProcessingScore({
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
  evaluateProcessingResponse,
};
