/**
 * OVERLOAD - Constraint Solver Evaluator
 * Evaluates constraint satisfaction precision and decision latency.
 */

import { LOGIC_MODES } from '../logicConstants.js';

export function evaluateConstraintSolverResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 12000;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: LOGIC_MODES.CONSTRAINT_SOLVER,
      difficultyLevel: level,
      isCorrect: false,
      isTimedOut: true,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED',
      evaluatedAt: Date.now(),
    };
  }

  const isCorrect = userChoiceId === task?.correctOptionId;

  return {
    taskId: task?.taskId,
    mode: LOGIC_MODES.CONSTRAINT_SOLVER,
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    chosenOptionId: userChoiceId,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect
      ? `${Math.round(responseTimeMs)} ms · All Constraints Satisfied`
      : 'CONSTRAINT VIOLATION',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateConstraintSolverResponse,
};
