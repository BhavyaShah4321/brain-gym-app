/**
 * OVERLOAD - Spatial Navigation Task Generator
 * Procedural generation for labyrinthine spatial grid environments with BFS validation.
 */

import { SPATIAL_MODES, TIMEOUT_WINDOWS_MS } from '../spatialConstants.js';
import { findShortestPath } from './spatialNavigationPathfinder.js';

function getRandomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function generateSpatialNavigationTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[SPATIAL_MODES.SPATIAL_NAVIGATION]?.[level] || 12000;
  const taskId = `nav_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Grid dimensions
  const gridSize = level <= 2 ? 3 : level <= 5 ? 4 : 5;
  const totalCells = gridSize * gridSize;

  // Obstacle counts
  const obstacleCount =
    level <= 2
      ? getRandomInt(1, 2)
      : level <= 5
      ? getRandomInt(3, 5)
      : getRandomInt(6, 9);

  let attempts = 0;
  while (attempts < 50) {
    attempts++;

    // Pick start and target at opposite regions
    const startRow = level <= 2 ? 0 : getRandomInt(0, 1);
    const startCol = level <= 2 ? 0 : getRandomInt(0, 1);
    const targetRow = level <= 2 ? 2 : getRandomInt(gridSize - 2, gridSize - 1);
    const targetCol = level <= 2 ? 2 : getRandomInt(gridSize - 2, gridSize - 1);

    const startIndex = startRow * gridSize + startCol;
    const targetIndex = targetRow * gridSize + targetCol;

    if (startIndex === targetIndex) continue;

    // Generate random obstacles
    const obstacles = [];
    const obstacleSet = new Set([startIndex, targetIndex]);

    while (obstacles.length < obstacleCount) {
      const or = getRandomInt(0, gridSize - 1);
      const oc = getRandomInt(0, gridSize - 1);
      const oIdx = or * gridSize + oc;
      if (!obstacleSet.has(oIdx)) {
        obstacleSet.add(oIdx);
        obstacles.push({ row: or, col: oc, index: oIdx });
      }
    }

    // BFS Verification
    const pathResult = findShortestPath({
      gridSize,
      start: { row: startRow, col: startCol },
      target: { row: targetRow, col: targetCol },
      obstacles,
    });

    if (pathResult.isReachable && pathResult.shortestDistance >= (gridSize - 1)) {
      return {
        taskId,
        mode: SPATIAL_MODES.SPATIAL_NAVIGATION,
        difficultyLevel: level,
        roundNumber,
        timeoutWindowMs,
        gridSize,
        start: { row: startRow, col: startCol, index: startIndex },
        target: { row: targetRow, col: targetCol, index: targetIndex },
        obstacles,
        optimalMoves: pathResult.shortestDistance,
        optimalPath: pathResult.optimalPath,
        instructionText: 'PLAN ROUTE TO TARGET',
        actionPrompt: 'NAVIGATE FROM START TO TARGET',
        createdAt: Date.now(),
      };
    }
  }

  // Safe fallback 3x3
  const fallbackObstacles = [{ row: 1, col: 1, index: 4 }];
  return {
    taskId,
    mode: SPATIAL_MODES.SPATIAL_NAVIGATION,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    gridSize: 3,
    start: { row: 0, col: 0, index: 0 },
    target: { row: 2, col: 2, index: 8 },
    obstacles: fallbackObstacles,
    optimalMoves: 4,
    optimalPath: [
      { row: 0, col: 0, index: 0 },
      { row: 0, col: 1, index: 1 },
      { row: 0, col: 2, index: 2 },
      { row: 1, col: 2, index: 5 },
      { row: 2, col: 2, index: 8 },
    ],
    instructionText: 'PLAN ROUTE TO TARGET',
    actionPrompt: 'NAVIGATE FROM START TO TARGET',
    createdAt: Date.now(),
  };
}

export default {
  generateSpatialNavigationTask,
};
