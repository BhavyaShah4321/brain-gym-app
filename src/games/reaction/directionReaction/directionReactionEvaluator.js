/**
 * OVERLOAD - Direction Reaction Evaluator
 * Evaluates stimulus-to-action mapping latency, false starts, and direction errors.
 */

import { REACTION_MODES } from '../reactionConstants.js';

export function evaluateDirectionReactionResponse({
  task,
  userDirectionId = null,
  responseTimeMs = 0,
  isFalseStart = false,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 2000;

  if (isFalseStart) {
    return {
      taskId: task?.taskId,
      mode: REACTION_MODES.DIRECTION_REACTION,
      difficultyLevel: level,
      isCorrect: false,
      isFalseStart: true,
      isTimedOut: false,
      isWrongChoice: false,
      responseTimeMs: 0,
      accuracy: 0,
      feedbackMessage: 'TOO EARLY',
      evaluatedAt: Date.now(),
    };
  }

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: REACTION_MODES.DIRECTION_REACTION,
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

  const isCorrect = userDirectionId === task?.targetDirection?.id;

  return {
    taskId: task?.taskId,
    mode: REACTION_MODES.DIRECTION_REACTION,
    difficultyLevel: level,
    isCorrect,
    isFalseStart: false,
    isTimedOut: false,
    isWrongChoice: !isCorrect,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect ? `${Math.round(responseTimeMs)} ms` : 'WRONG DIRECTION',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateDirectionReactionResponse,
};
