/**
 * OVERLOAD - Focus Response Evaluator
 * Pure evaluation function computing precision, tracking accuracy, speed bonuses, and combo points.
 * Zero UI coupling.
 */

import { FOCUS_MODES, getComboMultiplier } from './focusConstants.js';

/**
 * Evaluates a user response against an active Focus task.
 *
 * @param {Object} params
 * @param {Object} params.task - Active task from focusGenerator
 * @param {any} params.userResponse - Selected cell index or slot index
 * @param {number} params.responseTimeMs - Milliseconds elapsed from decision phase presentation to user response
 * @param {number} params.currentCombo - Consecutive correct responses
 * @returns {Object} Structured evaluation result
 */
export function evaluateFocusResponse({
  task,
  userResponse = null,
  responseTimeMs = 0,
  currentCombo = 0,
}) {
  if (!task) {
    throw new Error('Task object is required for evaluation.');
  }

  let isCorrect = false;
  let isMissed = false;
  let isFalsePositive = false;

  const mode = task.mode;
  const deadlineMs = task.responseDeadlineMs || 2500;
  const level = task.difficultyLevel || 1;

  if (mode === FOCUS_MODES.VISUAL_TRACKING) {
    const selectedSlot = userResponse;

    if (selectedSlot === null || selectedSlot === undefined) {
      isCorrect = false;
      isMissed = true;
    } else if (
      selectedSlot === task.finalTargetSlot ||
      selectedSlot === task.targetId
    ) {
      isCorrect = true;
    } else {
      isCorrect = false;
      isFalsePositive = true;
    }
  } else {
    // ── TARGET SEARCH ──
    const selectedIndex = userResponse;

    if (selectedIndex === null || selectedIndex === undefined) {
      isCorrect = false;
      isMissed = true;
    } else if (selectedIndex === task.correctAnswer) {
      isCorrect = true;
    } else {
      isCorrect = false;
      isFalsePositive = true;
    }
  }

  // Calculate Combo
  const nextCombo = isCorrect ? currentCombo + 1 : 0;
  const comboMultiplier = getComboMultiplier(isCorrect ? nextCombo : currentCombo);

  // ── SCORING FORMULA ──
  // Base points = 100
  // Speed bonus = remaining ms before deadline / 10
  // Difficulty multiplier = 1 + (level - 1) * 0.1
  // Combo multiplier = 1.0x to 1.5x
  let pointsAwarded = 0;
  let penaltyPoints = 0;

  if (isCorrect) {
    const basePoints = 100;
    const speedBonus = Math.max(0, Math.round((deadlineMs - Math.min(responseTimeMs, deadlineMs)) / 10));
    const diffMultiplier = 1 + (level - 1) * 0.1;

    pointsAwarded = Math.round((basePoints + speedBonus) * diffMultiplier * comboMultiplier);
  } else {
    penaltyPoints = isFalsePositive ? 40 : 20;
  }

  return {
    taskId: task.taskId,
    mode: task.mode,
    difficultyLevel: level,
    isCorrect,
    isMissed,
    isFalsePositive,
    selectedResponse: userResponse,
    correctAnswer: mode === FOCUS_MODES.VISUAL_TRACKING ? task.finalTargetSlot : task.correctAnswer,
    responseTimeMs: Math.max(0, responseTimeMs),
    responseDeadlineMs: deadlineMs,
    pointsAwarded,
    penaltyPoints,
    combo: nextCombo,
    comboMultiplier,
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateFocusResponse,
};
