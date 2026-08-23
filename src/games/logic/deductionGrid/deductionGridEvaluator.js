/**
 * OVERLOAD - Deduction Grid Evaluator
 * Evaluates deductive conclusion accuracy and reasoning latency.
 */

import { LOGIC_MODES } from '../logicConstants.js';

export function evaluateDeductionGridResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 15000;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: LOGIC_MODES.DEDUCTION_GRID,
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
    mode: LOGIC_MODES.DEDUCTION_GRID,
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    chosenOptionId: userChoiceId,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect
      ? `${Math.round(responseTimeMs)} ms · Valid Deduction`
      : 'INVALID DEDUCTION',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateDeductionGridResponse,
};
