/**
 * OVERLOAD - Pattern Shift Evaluator
 * Evaluates pattern transition detection and predictive accuracy.
 */

import { FLEXIBILITY_MODES } from '../flexibilityConstants.js';

export function evaluatePatternShiftResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 7000;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: FLEXIBILITY_MODES.PATTERN_SHIFT,
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
    mode: FLEXIBILITY_MODES.PATTERN_SHIFT,
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    chosenOptionId: userChoiceId,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect ? `${Math.round(responseTimeMs)} ms` : 'PATTERN MISMATCH',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluatePatternShiftResponse,
};
