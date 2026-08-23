/**
 * OVERLOAD - Number Scan Task Generator
 * Generates numerical grids for rapid visual search and target acquisition.
 */

import {
  PROCESSING_MODES,
  TIMEOUT_WINDOWS_MS,
} from '../processingConstants.js';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateNumberScanTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[PROCESSING_MODES.NUMBER_SCAN][level] || 4000;
  const taskId = `number_scan_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Grid dimensions: 3x3 (lvl 1-3, 9 cells), 4x3 (lvl 4-6, 12 cells), 4x4 (lvl 7-10, 16 cells)
  const cols = level <= 3 ? 3 : 4;
  const rows = level <= 3 ? 3 : level <= 6 ? 3 : 4;
  const totalCells = cols * rows;

  // Target number between 1 and 9
  const targetNumber = Math.floor(Math.random() * 9) + 1;

  // Number of target instances in grid: 1 for levels 1-5, 2-3 for levels 6-10
  const targetInstanceCount = level <= 5 ? 1 : Math.min(3, 2 + Math.floor((level - 6) / 2));

  // Pick random indices for targets
  const allIndices = Array.from({ length: totalCells }, (_, i) => i);
  const shuffledIndices = shuffle(allIndices);
  const targetIndices = shuffledIndices.slice(0, targetInstanceCount).sort((a, b) => a - b);

  // Fill grid with distractors (excluding target number)
  const distractorNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => n !== targetNumber);
  const gridCells = [];

  for (let i = 0; i < totalCells; i++) {
    if (targetIndices.includes(i)) {
      gridCells.push({
        id: `cell_${i}`,
        index: i,
        value: targetNumber,
        isTarget: true,
      });
    } else {
      const distractorVal = distractorNumbers[Math.floor(Math.random() * distractorNumbers.length)];
      gridCells.push({
        id: `cell_${i}`,
        index: i,
        value: distractorVal,
        isTarget: false,
      });
    }
  }

  return {
    taskId,
    mode: PROCESSING_MODES.NUMBER_SCAN,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    cols,
    rows,
    totalCells,
    targetNumber,
    targetInstanceCount,
    targetIndices,
    gridCells,
    instructionText: `TARGET: ${targetNumber}`,
    actionPrompt: targetInstanceCount > 1 ? `FIND ALL ${targetInstanceCount} INSTANCES` : `FIND NUMBER ${targetNumber}`,
    createdAt: Date.now(),
  };
}

export default {
  generateNumberScanTask,
};
