/**
 * OVERLOAD - Dual Rule Task Generator
 * Procedural generation for context-dependent rule dispatching and conditional switching.
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

export function generateDualRuleTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[FLEXIBILITY_MODES.DUAL_RULE]?.[level] || 6500;
  const taskId = `dual_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Context cues:
  // BLUE -> Sort by SHAPE
  // RED -> Sort by NUMBER (count: 1 to 4)
  // GOLD (Level 7+) -> Sort by COLOR
  const contexts = [
    { id: 'blue', colorName: 'BLUE', hex: '#3B82F6', targetRule: 'SHAPE', ruleDesc: 'CLASSIFY BY SHAPE' },
    { id: 'red', colorName: 'RED', hex: '#EF4444', targetRule: 'NUMBER', ruleDesc: 'CLASSIFY BY NUMBER' },
  ];

  if (level >= 7) {
    contexts.push({
      id: 'gold',
      colorName: 'GOLD',
      hex: '#F59E0B',
      targetRule: 'COLOR',
      ruleDesc: 'CLASSIFY BY COLOR',
    });
  }

  const activeContext = pickRandom(contexts);
  const activeShape = pickRandom(ATTRIBUTE_TOKENS.shapes);
  const activeColor = pickRandom(ATTRIBUTE_TOKENS.colors);
  const count = Math.floor(1 + Math.random() * 4); // 1, 2, 3, or 4

  const stimulus = {
    contextColor: activeContext.hex,
    contextName: activeContext.colorName,
    shape: activeShape,
    color: activeColor,
    count,
  };

  let options = [];
  let correctOptionId = '';

  if (activeContext.targetRule === 'SHAPE') {
    options = ATTRIBUTE_TOKENS.shapes.map((s) => ({
      id: `opt_${s.id}`,
      type: 'SHAPE',
      label: s.name,
      icon: s.icon,
      isCorrect: s.id === activeShape.id,
    }));
    correctOptionId = `opt_${activeShape.id}`;
  } else if (activeContext.targetRule === 'NUMBER') {
    options = [1, 2, 3, 4].map((num) => ({
      id: `opt_num_${num}`,
      type: 'NUMBER',
      label: `${num}`,
      isCorrect: num === count,
    }));
    correctOptionId = `opt_num_${count}`;
  } else {
    // COLOR
    options = ATTRIBUTE_TOKENS.colors.map((c) => ({
      id: `opt_col_${c.id}`,
      type: 'COLOR',
      label: c.name,
      hex: c.hex,
      isCorrect: c.id === activeColor.id,
    }));
    correctOptionId = `opt_col_${activeColor.id}`;
  }

  return {
    taskId,
    mode: FLEXIBILITY_MODES.DUAL_RULE,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    activeContext,
    stimulus,
    options: shuffle(options),
    correctOptionId,
    instructionText: `CONTEXT IS ${activeContext.colorName}: ${activeContext.ruleDesc}`,
    actionPrompt: `IF ${activeContext.colorName} → ${activeContext.targetRule}`,
    createdAt: Date.now(),
  };
}

export default {
  generateDualRuleTask,
};
