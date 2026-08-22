/**
 * OVERLOAD - Direction Reaction Task Generator
 * Generates directional stimuli (UP, DOWN, LEFT, RIGHT) based on progressive difficulty tiers.
 */

import {
  REACTION_MODES,
  DELAY_RANGES_MS,
  TIMEOUT_WINDOWS_MS,
  DIRECTION_DEFINITIONS,
  DIRECTIONS_LIST,
  REACTION_COLORS,
} from '../reactionConstants';

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDelay(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

/**
 * Generates an infinite procedural Direction Reaction task.
 *
 * @param {Object} params
 * @param {number} params.difficultyLevel - 1 to 10
 * @param {number} params.roundNumber - Current round number
 * @returns {Object} Structured task object
 */
export function generateDirectionReactionTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const delayRange = DELAY_RANGES_MS[level] || [1000, 2000];
  const stimulusDelayMs = getRandomDelay(delayRange[0], delayRange[1]);
  const timeoutWindowMs = TIMEOUT_WINDOWS_MS[level] || 2000;
  const taskId = `direction_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Active directions by difficulty:
  // Level 1: UP and DOWN
  // Level 2: LEFT and RIGHT
  // Level 3+: All 4 directions (UP, DOWN, LEFT, RIGHT)
  let activeDirections = DIRECTIONS_LIST;
  if (level === 1) {
    activeDirections = [DIRECTION_DEFINITIONS.UP, DIRECTION_DEFINITIONS.DOWN];
  } else if (level === 2) {
    activeDirections = [DIRECTION_DEFINITIONS.LEFT, DIRECTION_DEFINITIONS.RIGHT];
  }

  const targetDirection = pickRandom(activeDirections);
  const color = pickRandom([REACTION_COLORS.navy, REACTION_COLORS.gold, REACTION_COLORS.sage]);

  return {
    taskId,
    mode: REACTION_MODES.DIRECTION_REACTION,
    difficultyLevel: level,
    roundNumber,
    stimulusDelayMs,
    timeoutWindowMs,
    targetDirection,
    activeDirections,
    color: color.hex,
    instructionText: 'WAIT FOR DIRECTION...',
    instructionActive: `TAP [ ${targetDirection.symbol} ${targetDirection.label} ]`,
    createdAt: Date.now(),
  };
}

export default {
  generateDirectionReactionTask,
};
