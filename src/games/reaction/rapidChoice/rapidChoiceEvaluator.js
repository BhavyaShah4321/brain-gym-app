/**
 * OVERLOAD - Rapid Choice Evaluator
 * Evaluates decision speed, target discrimination accuracy, and mistakes.
 */

import { REACTION_MODES } from '../reactionConstants';

export function evaluateRapidChoiceResponse({
  task,
  userChoiceIndex = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 2000;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: REACTION_MODES.RAPID_CHOICE,
      difficultyLevel: level,
      isCorrect: false,
      isFalseStart: false,
      isTimedOut: true,
      isWrongChoice: false,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED',
      evaluatedAt: Date.now(),
    };
  }

  const isCorrect = userChoiceIndex === task?.correctAnswer;

  return {
    taskId: task?.taskId,
    mode: REACTION_MODES.RAPID_CHOICE,
    difficultyLevel: level,
    isCorrect,
    isFalseStart: false,
    isTimedOut: false,
    isWrongChoice: !isCorrect,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect ? `${Math.round(responseTimeMs)} ms` : 'WRONG CHOICE',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateRapidChoiceResponse,
};
