/**
 * OVERLOAD - Mirror Map Task Generator
 * Procedural generation for spatial coordinate reflections and grid transformations.
 */

import { SPATIAL_MODES, TIMEOUT_WINDOWS_MS } from '../spatialConstants.js';

function getRandomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateMirrorMapTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[SPATIAL_MODES.MIRROR_MAP]?.[level] || 7500;
  const taskId = `mirror_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const gridSize = level <= 4 ? 3 : 4;
  const transformTypes = ['HORIZONTAL_MIRROR', 'VERTICAL_MIRROR'];
  const transformType = pickRandom(transformTypes);

  let attempts = 0;
  while (attempts < 30) {
    attempts++;
    // Pick target object position (ensure it is not on the invariant symmetry axis if possible)
    const targetRow = getRandomInt(0, gridSize - 1);
    const targetCol = getRandomInt(0, gridSize - 1);

    let transformedRow = targetRow;
    let transformedCol = targetCol;

    if (transformType === 'HORIZONTAL_MIRROR') {
      transformedCol = gridSize - 1 - targetCol;
    } else {
      transformedRow = gridSize - 1 - targetRow;
    }

    // Invariant check: target must actually change position to require mental transformation
    if (transformedRow !== targetRow || transformedCol !== targetCol || gridSize === 3) {
      const targetIndex = targetRow * gridSize + targetCol;
      const transformedIndex = transformedRow * gridSize + transformedCol;

      // Generate 1 or 2 landmarks/obstacles at distinct positions
      const obstacleCount = level <= 3 ? 1 : level <= 7 ? 2 : 3;
      const obstacles = [];
      const occupied = new Set([targetIndex]);

      while (obstacles.length < obstacleCount) {
        const or = getRandomInt(0, gridSize - 1);
        const oc = getRandomInt(0, gridSize - 1);
        const oIdx = or * gridSize + oc;
        if (!occupied.has(oIdx)) {
          occupied.add(oIdx);
          obstacles.push({ row: or, col: oc, index: oIdx });
        }
      }

      const promptLabel =
        transformType === 'HORIZONTAL_MIRROR'
          ? 'HORIZONTAL REFLECTION (FLIP LEFT ⇄ RIGHT)'
          : 'VERTICAL REFLECTION (FLIP TOP ⇅ BOTTOM)';

      return {
        taskId,
        mode: SPATIAL_MODES.MIRROR_MAP,
        difficultyLevel: level,
        roundNumber,
        timeoutWindowMs,
        gridSize,
        transformType,
        promptLabel,
        target: { row: targetRow, col: targetCol, index: targetIndex },
        obstacles,
        correctIndex: transformedIndex,
        correctRow: transformedRow,
        correctCol: transformedCol,
        instructionText: 'APPLY REFLECTION TRANSFORMATION',
        actionPrompt: promptLabel,
        createdAt: Date.now(),
      };
    }
  }

  // Safe fallback
  return {
    taskId,
    mode: SPATIAL_MODES.MIRROR_MAP,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    gridSize: 3,
    transformType: 'HORIZONTAL_MIRROR',
    promptLabel: 'HORIZONTAL REFLECTION (FLIP LEFT ⇄ RIGHT)',
    target: { row: 0, col: 0, index: 0 },
    obstacles: [{ row: 1, col: 1, index: 4 }],
    correctIndex: 2,
    correctRow: 0,
    correctCol: 2,
    instructionText: 'APPLY REFLECTION TRANSFORMATION',
    actionPrompt: 'HORIZONTAL REFLECTION (FLIP LEFT ⇄ RIGHT)',
    createdAt: Date.now(),
  };
}

export default {
  generateMirrorMapTask,
};
