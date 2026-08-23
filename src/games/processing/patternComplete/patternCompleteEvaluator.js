/**
 * OVERLOAD - Pattern Complete Evaluator
 * Evaluates pattern sequence completion decisions and measures processing latency.
 */

import { PROCESSING_MODES } from '../processingConstants.js';

export function evaluatePatternCompleteResponse({
  task,
  userChoiceIndex = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 4500;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: PROCESSING_MODES.PATTERN_COMPLETE,
      difficultyLevel: level,
      isCorrect: false,
      isTimedOut: true,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED',
      evaluatedAt: Date.now(),
    };
  }

  const isCorrect = userChoiceIndex === task?.correctAnswerIndex;

  return {
    taskId: task?.taskId,
    mode: PROCESSING_MODES.PATTERN_COMPLETE,
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect ? `${Math.round(responseTimeMs)} ms` : 'PATTERN MISMATCH',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluatePatternCompleteResponse,
};
