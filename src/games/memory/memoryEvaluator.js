/**
 * OVERLOAD - Working Memory Evaluator
 * Pure evaluation logic for all 4 Working Memory games.
 * Zero UI coupling.
 */

import { MEMORY_MODES, getMemoryComboMultiplier } from './memoryConstants';

/**
 * Evaluates a user response against an active Working Memory task.
 *
 * @param {Object} params
 * @param {Object} params.task - The active task object
 * @param {any} params.userResponse - Array of selections or indices
 * @param {number} params.responseTimeMs - Elapsed response time in ms
 * @param {number} params.currentCombo - Consecutive perfect/correct rounds
 * @returns {Object} Structured evaluation result
 */
export function evaluateMemoryResponse({
  task,
  userResponse = [],
  responseTimeMs = 0,
  currentCombo = 0,
}) {
  if (!task) {
    throw new Error('Task object is required for evaluation.');
  }

  const mode = task.mode || MEMORY_MODES.SEQUENCE_RECALL;
  const span = task.span || 3;

  let isPerfect = false;
  let accuracy = 0;
  let correctItemsCount = 0;
  let totalItemsCount = 0;
  let missedItemsCount = 0;
  let extraWrongCount = 0;

  switch (mode) {
    case MEMORY_MODES.SEQUENCE_RECALL: {
      const targetSeq = task.sequence || [];
      const userSeq = Array.isArray(userResponse) ? userResponse : [];
      totalItemsCount = targetSeq.length;

      for (let i = 0; i < Math.min(userSeq.length, targetSeq.length); i++) {
        if (userSeq[i] === targetSeq[i]) {
          correctItemsCount += 1;
        }
      }

      isPerfect = userSeq.length === targetSeq.length && correctItemsCount === targetSeq.length;
      accuracy = totalItemsCount > 0 ? Math.round((correctItemsCount / totalItemsCount) * 100) : 0;
      missedItemsCount = totalItemsCount - correctItemsCount;
      break;
    }

    case MEMORY_MODES.GRID_MEMORY: {
      const targetCells = new Set(task.targetCells || []);
      const userSelected = new Set(Array.isArray(userResponse) ? userResponse : []);
      totalItemsCount = targetCells.size;

      userSelected.forEach((cellIdx) => {
        if (targetCells.has(cellIdx)) {
          correctItemsCount += 1;
        } else {
          extraWrongCount += 1;
        }
      });

      missedItemsCount = Math.max(0, totalItemsCount - correctItemsCount);
      isPerfect = correctItemsCount === totalItemsCount && extraWrongCount === 0;

      // Accuracy formula balances correct detections minus false selections
      const rawAcc = ((correctItemsCount - extraWrongCount * 0.5) / totalItemsCount) * 100;
      accuracy = Math.max(0, Math.min(100, Math.round(rawAcc)));
      break;
    }

    case MEMORY_MODES.OBJECT_RECALL: {
      const targetIds = new Set((task.targetObjects || []).map((o) => o.id));
      const userSelectedIds = new Set(Array.isArray(userResponse) ? userResponse : []);
      totalItemsCount = targetIds.size;

      userSelectedIds.forEach((id) => {
        if (targetIds.has(id)) {
          correctItemsCount += 1;
        } else {
          extraWrongCount += 1;
        }
      });

      missedItemsCount = Math.max(0, totalItemsCount - correctItemsCount);
      isPerfect = correctItemsCount === totalItemsCount && extraWrongCount === 0;

      const rawAcc = ((correctItemsCount - extraWrongCount * 0.5) / totalItemsCount) * 100;
      accuracy = Math.max(0, Math.min(100, Math.round(rawAcc)));
      break;
    }

    case MEMORY_MODES.ORDER_RECALL: {
      const targetOrder = task.orderedItems || [];
      const userOrder = Array.isArray(userResponse) ? userResponse : [];
      totalItemsCount = targetOrder.length;

      for (let i = 0; i < Math.min(userOrder.length, targetOrder.length); i++) {
        const targetId = targetOrder[i].id;
        const userId = typeof userOrder[i] === 'object' ? userOrder[i]?.id : userOrder[i];
        if (userId === targetId) {
          correctItemsCount += 1;
        }
      }

      isPerfect = userOrder.length === targetOrder.length && correctItemsCount === targetOrder.length;
      accuracy = totalItemsCount > 0 ? Math.round((correctItemsCount / totalItemsCount) * 100) : 0;
      missedItemsCount = totalItemsCount - correctItemsCount;
      break;
    }

    default:
      throw new Error(`Unsupported mode for memory evaluation: ${mode}`);
  }

  // Calculate Combo
  const nextCombo = isPerfect ? currentCombo + 1 : 0;
  const comboMultiplier = getMemoryComboMultiplier(isPerfect ? nextCombo : currentCombo);

  // Scoring Formula:
  // Base points = accuracy * 6
  // Span multiplier = span * 25
  // Speed bonus = Math.max(0, Math.round((4000 - responseTimeMs) / 30))
  let pointsAwarded = 0;
  let penaltyPoints = 0;

  if (accuracy > 0) {
    const baseScore = accuracy * 6;
    const spanBonus = span * 25;
    const speedBonus = Math.max(0, Math.round((4000 - Math.min(responseTimeMs, 4000)) / 30));
    pointsAwarded = Math.round((baseScore + spanBonus + speedBonus) * comboMultiplier);
  } else {
    penaltyPoints = 30;
  }

  return {
    taskId: task.taskId,
    mode,
    span,
    isPerfect,
    accuracy,
    correctItemsCount,
    totalItemsCount,
    missedItemsCount,
    extraWrongCount,
    responseTimeMs: Math.max(0, responseTimeMs),
    pointsAwarded,
    penaltyPoints,
    combo: nextCombo,
    comboMultiplier,
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateMemoryResponse,
};
