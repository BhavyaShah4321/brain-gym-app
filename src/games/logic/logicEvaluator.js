/**
 * OVERLOAD - Logic Response Evaluator Router
 * Pure evaluation function delegating to mode evaluators and applying scoring formulas.
 */

import { LOGIC_MODES } from './logicConstants.js';
import { evaluateDeductionGridResponse } from './deductionGrid/deductionGridEvaluator.js';
import { evaluateSequenceLogicResponse } from './sequenceLogic/sequenceLogicEvaluator.js';
import { evaluateConstraintSolverResponse } from './constraintSolver/constraintSolverEvaluator.js';
import { calculateLogicScore } from './logicScoring.js';

/**
 * Evaluates a logic response across Deduction Grid, Sequence Logic, or Constraint Solver.
 *
 * @param {Object} params
 * @param {Object} params.task - The active task object
 * @param {string} params.userResponse - Selected option ID
 * @param {number} params.responseTimeMs - Milliseconds elapsed
 * @param {boolean} params.isTimedOut - True if timeout expired
 * @param {number} params.currentCombo - Consecutive correct rounds
 * @returns {Object} Structured evaluation result with score and telemetry
 */
export function evaluateLogicResponse({
  task,
  userResponse = null,
  responseTimeMs = 0,
  isTimedOut = false,
  currentCombo = 0,
}) {
  if (!task) {
    throw new Error('Task object is required for logic evaluation.');
  }

  const mode = task.mode || LOGIC_MODES.DEDUCTION_GRID;
  const timeoutWindowMs = task.timeoutWindowMs || 12000;
  const difficultyLevel = task.difficultyLevel || 1;

  let rawEvaluation = null;

  switch (mode) {
    case LOGIC_MODES.DEDUCTION_GRID:
      rawEvaluation = evaluateDeductionGridResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case LOGIC_MODES.SEQUENCE_LOGIC:
      rawEvaluation = evaluateSequenceLogicResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case LOGIC_MODES.CONSTRAINT_SOLVER:
      rawEvaluation = evaluateConstraintSolverResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    default:
      rawEvaluation = evaluateDeductionGridResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;
  }

  const isCorrect = Boolean(rawEvaluation.isCorrect);
  const nextCombo = isCorrect ? currentCombo + 1 : 0;

  const scoreResult = calculateLogicScore({
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
  evaluateLogicResponse,
};
