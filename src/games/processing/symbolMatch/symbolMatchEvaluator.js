/**
 * OVERLOAD - Symbol Match Evaluator
 * Evaluates visual comparison decisions and measures processing latency.
 */

import { PROCESSING_MODES } from '../processingConstants.js';

export function evaluateSymbolMatchResponse({
  task,
  userChoice = null, // 'match' | 'different'
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 3500;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: PROCESSING_MODES.SYMBOL_MATCH,
      difficultyLevel: level,
      isCorrect: false,
      isTimedOut: true,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED',
      evaluatedAt: Date.now(),
    };
  }

  const isCorrect = userChoice === task?.correctAnswer;

  return {
    taskId: task?.taskId,
    mode: PROCESSING_MODES.SYMBOL_MATCH,
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect ? `${Math.round(responseTimeMs)} ms` : 'INCORRECT MATCH',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateSymbolMatchResponse,
};
