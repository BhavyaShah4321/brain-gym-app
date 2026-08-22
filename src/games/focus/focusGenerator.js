/**
 * OVERLOAD - Focus Task Generator
 * Pure procedural task generation for Target Search and Visual Tracking.
 * Zero hardcoded task lists.
 */

import {
  FOCUS_MODES,
  LEVEL_DEADLINES_MS,
  LEVEL_GRID_CONFIG,
  TRACKING_LEVEL_CONFIG,
  STIMULI_COLORS,
  STIMULI_SHAPES,
} from './focusConstants';

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates an infinite Focus task for the requested mode and difficulty level.
 *
 * @param {Object} params
 * @param {string} params.mode - 'target_search' | 'visual_tracking'
 * @param {number} params.difficultyLevel - 1 to 10
 * @param {number} params.roundNumber - Current round index
 * @returns {Object} Structured task object
 */
export function generateFocusTask({
  mode = FOCUS_MODES.TARGET_SEARCH,
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const deadlineMs = LEVEL_DEADLINES_MS[level] || 2500;
  const taskId = `focus_${mode}_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (mode === FOCUS_MODES.VISUAL_TRACKING) {
    return generateVisualTrackingTask({
      taskId,
      level,
      roundNumber,
      deadlineMs,
    });
  }

  // ── MODE A: TARGET SEARCH ──
  return generateTargetSearchTask({
    taskId,
    level,
    roundNumber,
    deadlineMs,
  });
}

/**
 * Generates a procedural Target Search task.
 */
function generateTargetSearchTask({ taskId, level, roundNumber, deadlineMs }) {
  const gridConfig = LEVEL_GRID_CONFIG[level] || LEVEL_GRID_CONFIG[1];
  const totalItems = gridConfig.count;
  const gridCols = gridConfig.cols;

  const targetShape = pickRandom(STIMULI_SHAPES);
  const targetColor = pickRandom(STIMULI_COLORS);
  const targetIndex = Math.floor(Math.random() * totalItems);

  const otherShapes = STIMULI_SHAPES.filter((s) => s !== targetShape);
  const otherColors = STIMULI_COLORS.filter((c) => c.hex !== targetColor.hex);

  const stimuli = [];
  for (let i = 0; i < totalItems; i++) {
    if (i === targetIndex) {
      stimuli.push({
        id: i,
        shape: targetShape,
        color: targetColor.hex,
        colorName: targetColor.name,
        isTarget: true,
      });
    } else {
      let dShape = pickRandom(otherShapes);
      let dColor = pickRandom(otherColors);

      if (level >= 3 && level <= 5) {
        if (Math.random() < 0.5) {
          dColor = targetColor;
        } else if (Math.random() < 0.5) {
          dShape = targetShape;
        }
      } else if (level >= 6) {
        const roll = Math.random();
        if (roll < 0.45) {
          dColor = targetColor;
        } else if (roll < 0.85) {
          dShape = targetShape;
        }
      }

      stimuli.push({
        id: i,
        shape: dShape,
        color: dColor.hex,
        colorName: dColor.name,
        isTarget: false,
      });
    }
  }

  return {
    taskId,
    mode: FOCUS_MODES.TARGET_SEARCH,
    difficultyLevel: level,
    roundNumber,
    target: {
      shape: targetShape,
      color: targetColor.hex,
      colorName: targetColor.name,
      label: `${targetColor.name} ${targetShape}`,
      instructionText: `SELECT ${targetShape}`,
      instructionSubtext: `Locate the ${targetColor.name} ${targetShape}`,
    },
    stimuli,
    correctAnswer: targetIndex,
    totalItems,
    gridCols,
    responseDeadlineMs: deadlineMs,
    createdAt: Date.now(),
  };
}

/**
 * Generates a procedural Visual Tracking task.
 */
function generateVisualTrackingTask({ taskId, level, roundNumber, deadlineMs }) {
  const config = TRACKING_LEVEL_CONFIG[level] || TRACKING_LEVEL_CONFIG[1];
  const objectCount = config.objectCount;
  const movementSteps = config.movementSteps;
  const stepDurationMs = config.stepDurationMs;

  // Total available slot coordinates on the tracking field (e.g. 8 slots around a center)
  const totalSlots = Math.max(objectCount, 8);
  const availableSlots = Array.from({ length: totalSlots }, (_, i) => i);
  const shuffledSlots = shuffle(availableSlots);

  // Objects initialization
  const objects = [];
  const initialSlotMap = {}; // objectId -> slotIndex

  for (let i = 0; i < objectCount; i++) {
    const slotIdx = shuffledSlots[i];
    objects.push({
      id: i,
      initialSlot: slotIdx,
    });
    initialSlotMap[i] = slotIdx;
  }

  // Pick target object
  const targetId = Math.floor(Math.random() * objectCount);
  const initialTargetSlot = initialSlotMap[targetId];

  // Procedurally generate discrete, smooth swap steps
  let currentSlotMap = { ...initialSlotMap };
  const swapSteps = [];

  for (let s = 0; s < movementSteps; s++) {
    // Pick two objects to swap
    let objA = Math.floor(Math.random() * objectCount);
    let objB = Math.floor(Math.random() * objectCount);
    while (objB === objA) {
      objB = Math.floor(Math.random() * objectCount);
    }

    // Ensure target is involved frequently
    if (s % 2 === 0 && objA !== targetId && objB !== targetId) {
      if (Math.random() < 0.7) {
        objA = targetId;
      }
    }

    const slotA = currentSlotMap[objA];
    const slotB = currentSlotMap[objB];

    // Swap slots
    currentSlotMap[objA] = slotB;
    currentSlotMap[objB] = slotA;

    swapSteps.push({
      stepIndex: s,
      swappedObjects: [objA, objB],
      slotMap: { ...currentSlotMap },
      targetSlot: currentSlotMap[targetId],
    });
  }

  const finalTargetSlot = currentSlotMap[targetId];

  return {
    taskId,
    mode: FOCUS_MODES.VISUAL_TRACKING,
    difficultyLevel: level,
    roundNumber,
    objectCount,
    totalSlots,
    targetId,
    initialTargetSlot,
    finalTargetSlot,
    initialSlotMap,
    finalSlotMap: currentSlotMap,
    swapSteps,
    stepDurationMs,
    highlightDurationMs: 1400,
    totalMovementDurationMs: movementSteps * stepDurationMs,
    instructionText: 'TRACK THE HIGHLIGHTED TARGET',
    instructionSubtext: 'Follow the target as objects move, then tap its final location',
    responseDeadlineMs: deadlineMs,
    createdAt: Date.now(),
  };
}

export default {
  generateFocusTask,
};
