/**
 * OVERLOAD - Target Tap Task Generator
 * Generates randomized pre-stimulus delays, dynamic target positions, and accessible touch targets.
 */

import {
  REACTION_MODES,
  DELAY_RANGES_MS,
  TIMEOUT_WINDOWS_MS,
  REACTION_SHAPES,
  REACTION_COLORS,
} from '../reactionConstants';

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDelay(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

export function generateTargetTapTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const delayRange = DELAY_RANGES_MS[level] || [1000, 2000];
  const stimulusDelayMs = getRandomDelay(delayRange[0], delayRange[1]);
  const timeoutWindowMs = TIMEOUT_WINDOWS_MS[level] || 2000;
  const taskId = `target_tap_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Target size scales with level but maintains minimum 64px touch target for Android
  const targetSize = Math.max(64, 96 - (level - 1) * 3.5);

  // Position offset (normalized -0.6 to 0.6 of arena width/height at higher levels)
  let offsetX = 0;
  let offsetY = 0;
  if (level >= 3) {
    const maxOffset = Math.min(0.65, 0.2 + (level - 3) * 0.08);
    offsetX = (Math.random() * 2 - 1) * maxOffset;
    offsetY = (Math.random() * 2 - 1) * maxOffset;
  }

  const shape = pickRandom(REACTION_SHAPES);
  const color = pickRandom(Object.values(REACTION_COLORS));

  return {
    taskId,
    mode: REACTION_MODES.TARGET_TAP,
    difficultyLevel: level,
    roundNumber,
    stimulusDelayMs,
    timeoutWindowMs,
    target: {
      shape: shape.symbol,
      shapeName: shape.name,
      color: color.hex,
      colorName: color.name,
      size: targetSize,
      offsetX,
      offsetY,
    },
    instructionText: 'WAIT FOR TARGET...',
    instructionActive: 'TAP THE TARGET NOW!',
    createdAt: Date.now(),
  };
}

export default {
  generateTargetTapTask,
};
