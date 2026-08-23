/**
 * OVERLOAD - Sort Shift Task Generator
 * Procedural generation for dynamic mental set shifting and sorting dimension transitions.
 */

import {
  FLEXIBILITY_MODES,
  TIMEOUT_WINDOWS_MS,
  ATTRIBUTE_TOKENS,
} from '../flexibilityConstants.js';

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

export function generateSortShiftTask({
  difficultyLevel = 1,
  roundNumber = 1,
  previousRule = null,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[FLEXIBILITY_MODES.SORT_SHIFT]?.[level] || 6000;
  const taskId = `sort_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Available dimensions
  const availableDimensions = ['COLOR', 'SHAPE'];
  if (level >= 4) {
    availableDimensions.push('SIZE');
  }

  // Determine active rule: switch rule periodically or on run change
  let activeRule = previousRule;
  // Shift every 2-4 rounds or if no previous rule
  const shouldSwitch = !previousRule || roundNumber === 1 || Math.random() < (0.35 + (level - 1) * 0.05);

  if (shouldSwitch) {
    const otherRules = availableDimensions.filter((d) => d !== previousRule);
    activeRule = pickRandom(otherRules.length > 0 ? otherRules : availableDimensions);
  }

  const isRuleShiftTrial = previousRule !== null && activeRule !== previousRule;

  // Generate stimulus object with multi-attribute properties
  const activeColor = pickRandom(ATTRIBUTE_TOKENS.colors);
  const activeShape = pickRandom(ATTRIBUTE_TOKENS.shapes);
  const activeSize = pickRandom(ATTRIBUTE_TOKENS.sizes);

  const stimulus = {
    color: activeColor,
    shape: activeShape,
    size: activeSize,
    label: `${activeSize.name} ${activeColor.name} ${activeShape.name}`,
  };

  // Generate category options based on active dimension
  let options = [];
  let correctOptionId = '';

  if (activeRule === 'COLOR') {
    options = ATTRIBUTE_TOKENS.colors.map((c) => ({
      id: `color_${c.id}`,
      type: 'COLOR',
      value: c.id,
      label: c.name,
      hex: c.hex,
    }));
    correctOptionId = `color_${activeColor.id}`;
  } else if (activeRule === 'SHAPE') {
    options = ATTRIBUTE_TOKENS.shapes.map((s) => ({
      id: `shape_${s.id}`,
      type: 'SHAPE',
      value: s.id,
      label: s.name,
      icon: s.icon,
      hex: activeColor.hex,
    }));
    correctOptionId = `shape_${activeShape.id}`;
  } else {
    // SIZE
    options = ATTRIBUTE_TOKENS.sizes.map((sz) => ({
      id: `size_${sz.id}`,
      type: 'SIZE',
      value: sz.id,
      label: sz.name,
      scale: sz.scale,
    }));
    correctOptionId = `size_${activeSize.id}`;
  }

  return {
    taskId,
    mode: FLEXIBILITY_MODES.SORT_SHIFT,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    activeRule,
    isRuleShiftTrial,
    previousRule,
    stimulus,
    options: shuffle(options),
    correctOptionId,
    instructionText: isRuleShiftTrial
      ? `RULE SHIFT: SORT BY ${activeRule}`
      : `SORT BY ${activeRule}`,
    actionPrompt: `CLASSIFY OBJECT ACCORDING TO ${activeRule}`,
    createdAt: Date.now(),
  };
}

export default {
  generateSortShiftTask,
};
