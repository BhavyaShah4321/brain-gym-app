/**
 * OVERLOAD - Mirror Map Evaluator
 * Evaluates reflection transformation accuracy and coordinate selection.
 */

import { SPATIAL_MODES } from '../spatialConstants.js';

export function evaluateMirrorMapResponse({
  task,
  selectedCellIndex = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 7500;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: SPATIAL_MODES.MIRROR_MAP,
      difficultyLevel: level,
      isCorrect: false,
      isTimedOut: true,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED',
      evaluatedAt: Date.now(),
    };
  }

  const isCorrect = selectedCellIndex === task?.correctIndex;

  return {
    taskId: task?.taskId,
    mode: SPATIAL_MODES.MIRROR_MAP,
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    selectedCellIndex,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect ? `${Math.round(responseTimeMs)} ms` : 'INCORRECT TRANSFORMATION',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateMirrorMapResponse,
};
