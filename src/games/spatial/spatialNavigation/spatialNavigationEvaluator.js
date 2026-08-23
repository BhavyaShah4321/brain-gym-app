/**
 * OVERLOAD - Spatial Navigation Evaluator
 * Evaluates route completion, path efficiency, move count, and decision latency.
 */

import { SPATIAL_MODES } from '../spatialConstants.js';

export function evaluateSpatialNavigationResponse({
  task,
  playerPath = [],
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 12000;
  const optimalMoves = task?.optimalMoves || 1;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: SPATIAL_MODES.SPATIAL_NAVIGATION,
      difficultyLevel: level,
      isCorrect: false,
      isTimedOut: true,
      movesCount: playerPath.length > 0 ? playerPath.length - 1 : 0,
      optimalMoves,
      routeEfficiency: 0,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED',
      evaluatedAt: Date.now(),
    };
  }

  const lastCellIndex = playerPath[playerPath.length - 1];
  const isReached = lastCellIndex === task?.target?.index;
  const movesCount = Math.max(1, playerPath.length - 1);

  // Efficiency = optimalMoves / playerMoves * 100% (capped at 100)
  const routeEfficiency = isReached
    ? Math.min(100, Math.round((optimalMoves / movesCount) * 100))
    : 0;

  return {
    taskId: task?.taskId,
    mode: SPATIAL_MODES.SPATIAL_NAVIGATION,
    difficultyLevel: level,
    isCorrect: isReached,
    isTimedOut: false,
    movesCount,
    optimalMoves,
    routeEfficiency,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isReached ? routeEfficiency : 0,
    feedbackMessage: isReached
      ? `${routeEfficiency}% EFFICIENCY (${movesCount} MOVES)`
      : 'TARGET NOT REACHED',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateSpatialNavigationResponse,
};
