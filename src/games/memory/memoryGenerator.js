/**
 * OVERLOAD - Working Memory Task Generator
 * Procedural generation for all 4 Working Memory games:
 * 1. Sequence Recall (serial path)
 * 2. Grid Memory (simultaneous spatial matrix)
 * 3. Object Recall (visual item recognition)
 * 4. Order Recall (temporal sequence reconstruction)
 */

import {
  MEMORY_MODES,
  MEMORY_SHAPES,
  MEMORY_COLORS,
} from './memoryConstants';

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

/**
 * Generates an infinite procedural task for any Working Memory mode.
 *
 * @param {Object} params
 * @param {string} params.mode - 'sequence_recall' | 'grid_memory' | 'object_recall' | 'order_recall'
 * @param {number} params.span - Difficulty span level (2 to 9)
 * @param {number} params.roundNumber - Current round
 * @returns {Object} Structured task object
 */
export function generateMemoryTask({
  mode = MEMORY_MODES.SEQUENCE_RECALL,
  span = 3,
  roundNumber = 1,
} = {}) {
  const taskId = `mem_${mode}_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const currentSpan = Math.max(2, Math.min(9, span));

  switch (mode) {
    case MEMORY_MODES.SEQUENCE_RECALL: {
      // ── GAME 1: SEQUENCE RECALL (Serial order) ──
      const gridSize = 9;
      const sequence = [];
      while (sequence.length < currentSpan) {
        const nextCell = Math.floor(Math.random() * gridSize);
        if (sequence.length === 0 || sequence[sequence.length - 1] !== nextCell) {
          sequence.push(nextCell);
        }
      }

      return {
        taskId,
        mode: MEMORY_MODES.SEQUENCE_RECALL,
        span: currentSpan,
        gridSize,
        sequence,
        displayDurationMs: currentSpan * 650 + 400,
        createdAt: Date.now(),
      };
    }

    case MEMORY_MODES.GRID_MEMORY: {
      // ── GAME 2: GRID MEMORY (Simultaneous spatial matrix) ──
      const gridSize = currentSpan >= 7 ? 16 : 9; // 3x3 for spans 2-6, 4x4 for spans 7-9
      const gridCols = gridSize === 16 ? 4 : 3;
      const targetCount = Math.min(gridSize - 1, currentSpan);

      const allCells = Array.from({ length: gridSize }, (_, i) => i);
      const shuffledCells = shuffle(allCells);
      const targetCells = shuffledCells.slice(0, targetCount).sort((a, b) => a - b);

      return {
        taskId,
        mode: MEMORY_MODES.GRID_MEMORY,
        span: currentSpan,
        gridSize,
        gridCols,
        targetCells,
        targetCount,
        displayDurationMs: Math.max(1200, 1000 + targetCount * 150),
        createdAt: Date.now(),
      };
    }

    case MEMORY_MODES.OBJECT_RECALL: {
      // ── GAME 3: OBJECT RECALL (Visual recognition & distractors) ──
      const targetCount = Math.min(6, Math.max(2, currentSpan));
      const distractorCount = Math.min(6, Math.max(2, currentSpan));

      const shuffledShapes = shuffle(MEMORY_SHAPES);
      const targetObjects = [];

      for (let i = 0; i < targetCount; i++) {
        const shapeObj = shuffledShapes[i % shuffledShapes.length];
        const colorObj = MEMORY_COLORS[i % MEMORY_COLORS.length];
        targetObjects.push({
          id: `target_${i}_${shapeObj.id}`,
          shape: shapeObj.symbol,
          name: shapeObj.name,
          color: colorObj.hex,
          colorName: colorObj.name,
          isTarget: true,
        });
      }

      // Distractor objects with distinct features
      const remainingShapes = shuffledShapes.slice(targetCount);
      const distractorObjects = [];

      for (let i = 0; i < distractorCount; i++) {
        const shapeObj = (remainingShapes[i] || pickRandom(MEMORY_SHAPES));
        const colorObj = MEMORY_COLORS[(i + 2) % MEMORY_COLORS.length];
        distractorObjects.push({
          id: `distractor_${i}_${shapeObj.id}`,
          shape: shapeObj.symbol,
          name: shapeObj.name,
          color: colorObj.hex,
          colorName: colorObj.name,
          isTarget: false,
        });
      }

      const allChoices = shuffle([...targetObjects, ...distractorObjects]);

      return {
        taskId,
        mode: MEMORY_MODES.OBJECT_RECALL,
        span: currentSpan,
        targetObjects,
        distractorObjects,
        allChoices,
        targetCount,
        displayDurationMs: Math.max(1500, 1200 + targetCount * 300),
        createdAt: Date.now(),
      };
    }

    case MEMORY_MODES.ORDER_RECALL: {
      // ── GAME 4: ORDER RECALL (Temporal reconstruction) ──
      const itemCount = Math.min(6, Math.max(3, currentSpan));
      const shuffledShapes = shuffle(MEMORY_SHAPES);
      const orderedItems = [];

      for (let i = 0; i < itemCount; i++) {
        const shapeObj = shuffledShapes[i];
        const colorObj = MEMORY_COLORS[i % MEMORY_COLORS.length];
        orderedItems.push({
          id: `order_${i}_${shapeObj.id}`,
          originalIndex: i,
          shape: shapeObj.symbol,
          name: shapeObj.name,
          color: colorObj.hex,
          colorName: colorObj.name,
        });
      }

      // Shuffled presentation pool for reconstruction
      const shuffledPool = shuffle(orderedItems);

      return {
        taskId,
        mode: MEMORY_MODES.ORDER_RECALL,
        span: currentSpan,
        orderedItems,
        shuffledPool,
        itemCount,
        displayDurationMs: Math.max(1500, 1200 + itemCount * 350),
        createdAt: Date.now(),
      };
    }

    default:
      throw new Error(`Unsupported working memory game mode: ${mode}`);
  }
}

export default {
  generateMemoryTask,
};
