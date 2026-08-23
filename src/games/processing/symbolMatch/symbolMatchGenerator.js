/**
 * OVERLOAD - Symbol Match Task Generator
 * Generates dual symbol sets for rapid visual comparison.
 */

import {
  PROCESSING_MODES,
  PROCESSING_SHAPES,
  PROCESSING_COLORS,
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

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateSymbolMatchTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[PROCESSING_MODES.SYMBOL_MATCH][level] || 3500;
  const taskId = `symbol_match_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Symbol count per set: 3-4 (lvl 1-3), 5-6 (lvl 4-7), 7-8 (lvl 8-10)
  const symbolCount = level <= 3 ? 3 + (level - 1) : level <= 7 ? 4 + Math.floor((level - 3) / 2) : 7 + (level - 8);

  const availableShapes = shuffle(PROCESSING_SHAPES);
  const leftSet = [];

  for (let i = 0; i < symbolCount; i++) {
    const shapeObj = availableShapes[i % availableShapes.length];
    const colorObj = PROCESSING_COLORS[i % PROCESSING_COLORS.length];
    leftSet.push({
      id: `sym_${i}_${shapeObj.id}`,
      shape: shapeObj.symbol,
      name: shapeObj.name,
      color: colorObj.hex,
    });
  }

  // 50% probability of exact match vs different
  const isMatch = Math.random() < 0.5;
  let rightSet = [];

  if (isMatch) {
    // Exact clone
    rightSet = leftSet.map((s) => ({ ...s }));
  } else {
    // Introduce 1 or 2 targeted differences
    rightSet = leftSet.map((s) => ({ ...s }));
    const diffIndex = Math.floor(Math.random() * symbolCount);

    const otherShapes = PROCESSING_SHAPES.filter((s) => s.symbol !== leftSet[diffIndex].shape);
    const replacementShape = pickRandom(otherShapes);
    const replacementColor = pickRandom(PROCESSING_COLORS);

    rightSet[diffIndex] = {
      id: `diff_${diffIndex}_${replacementShape.id}`,
      shape: replacementShape.symbol,
      name: replacementShape.name,
      color: replacementColor.hex,
    };
  }

  return {
    taskId,
    mode: PROCESSING_MODES.SYMBOL_MATCH,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    symbolCount,
    leftSet,
    rightSet,
    isMatch,
    correctAnswer: isMatch ? 'match' : 'different',
    instructionText: 'COMPARE LEFT AND RIGHT SETS',
    actionPrompt: 'DO THEY MATCH EXACTLY?',
    createdAt: Date.now(),
  };
}

export default {
  generateSymbolMatchTask,
};
