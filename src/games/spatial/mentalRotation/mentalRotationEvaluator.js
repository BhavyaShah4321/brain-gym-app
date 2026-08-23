/**
 * OVERLOAD - Mental Rotation Evaluator
 * Evaluates spatial transformation accuracy and rotation decision latency.
 */

import { SPATIAL_MODES } from '../spatialConstants.js';

export function evaluateMentalRotationResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 7500;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: SPATIAL_MODES.MENTAL_ROTATION,
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
    mode: SPATIAL_MODES.MENTAL_ROTATION,
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    chosenOptionId: userChoiceId,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect ? `${Math.round(responseTimeMs)} ms` : 'INVALID ORIENTATION',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateMentalRotationResponse,
};
