/**
 * OVERLOAD - Target Tap Evaluator
 * Evaluates motor latency, false starts, and timeout conditions for Target Tap.
 */

import { REACTION_MODES } from '../reactionConstants';

export function evaluateTargetTapResponse({
  task,
  responseTimeMs = 0,
  isFalseStart = false,
  isTimedOut = false,
  currentCombo = 0,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 2000;

  if (isFalseStart) {
    return {
      taskId: task?.taskId,
      mode: REACTION_MODES.TARGET_TAP,
      difficultyLevel: level,
      isCorrect: false,
      isFalseStart: true,
      isTimedOut: false,
      responseTimeMs: 0,
      accuracy: 0,
      feedbackMessage: 'TOO EARLY',
      evaluatedAt: Date.now(),
    };
  }

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: REACTION_MODES.TARGET_TAP,
      difficultyLevel: level,
      isCorrect: false,
      isFalseStart: false,
      isTimedOut: true,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED',
      evaluatedAt: Date.now(),
    };
  }

  return {
    taskId: task?.taskId,
    mode: REACTION_MODES.TARGET_TAP,
    difficultyLevel: level,
    isCorrect: true,
    isFalseStart: false,
    isTimedOut: false,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: 100,
    feedbackMessage: `${Math.round(responseTimeMs)} ms`,
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateTargetTapResponse,
};
