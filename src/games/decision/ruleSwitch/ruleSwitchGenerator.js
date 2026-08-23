/**
 * OVERLOAD - Rule Switch Task Generator
 * Procedural generation for dynamic, conditional decision rules and cognitive flexibility.
 */

import { RULE_MODIFIER_COLORS } from '../decisionConstants.js';

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateRuleSwitchTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs = 6500 - (level - 1) * 380;
  const taskId = `rule_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Level 1-3: Simple 2-rule switch (Larger vs Smaller)
  // Level 4-6: Color-conditional 2-rule switch (Navy = Larger, Gold = Smaller)
  // Level 7-10: Color-conditional 3-rule switch (+ Sage = Closest to 50, Rose = Even)
  const isConditional = level >= 4;
  let activeModifier = null;
  let activeRuleName = '';
  let rulePrompt = '';

  if (!isConditional) {
    const isLarger = Math.random() < 0.5;
    activeRuleName = isLarger ? 'LARGER' : 'SMALLER';
    rulePrompt = isLarger ? 'CHOOSE THE LARGER NUMBER' : 'CHOOSE THE SMALLER NUMBER';
    activeModifier = isLarger ? RULE_MODIFIER_COLORS.navy : RULE_MODIFIER_COLORS.gold;
  } else if (level <= 6) {
    const modOptions = [RULE_MODIFIER_COLORS.navy, RULE_MODIFIER_COLORS.gold];
    activeModifier = pickRandom(modOptions);
    activeRuleName = activeModifier.id === 'navy' ? 'LARGER' : 'SMALLER';
    rulePrompt = `CARD IS ${activeModifier.name.toUpperCase()}: CHOOSE ${activeRuleName}`;
  } else {
    const modOptions = [
      RULE_MODIFIER_COLORS.navy,
      RULE_MODIFIER_COLORS.gold,
      RULE_MODIFIER_COLORS.sage,
      RULE_MODIFIER_COLORS.rose,
    ];
    activeModifier = pickRandom(modOptions);
    activeRuleName = activeModifier.ruleDesc;
    rulePrompt = `CARD IS ${activeModifier.name.toUpperCase()}: CHOOSE ${activeRuleName}`;
  }

  // Generate 2 to 4 unique numbers
  const optionCount = level <= 3 ? 2 : level <= 7 ? 3 : 4;
  const numbersSet = new Set();
  while (numbersSet.size < optionCount) {
    numbersSet.add(getRandomInt(12, 88));
  }
  const numbers = Array.from(numbersSet);

  let correctValue = null;
  if (activeModifier.id === 'navy' || activeRuleName === 'LARGER') {
    correctValue = Math.max(...numbers);
  } else if (activeModifier.id === 'gold' || activeRuleName === 'SMALLER') {
    correctValue = Math.min(...numbers);
  } else if (activeModifier.id === 'sage') {
    // Closest to 50
    const diffs = numbers.map((n) => ({ val: n, diff: Math.abs(n - 50) }));
    diffs.sort((a, b) => a.diff - b.diff);
    correctValue = diffs[0].val;
  } else {
    // Even number
    const evens = numbers.filter((n) => n % 2 === 0);
    if (evens.length === 1) {
      correctValue = evens[0];
    } else {
      correctValue = Math.max(...numbers);
    }
  }

  const options = numbers.map((num, idx) => ({
    id: `opt_${idx}`,
    value: num,
    color: activeModifier.hex,
  }));

  const correctOption = options.find((o) => o.value === correctValue) || options[0];

  return {
    taskId,
    mode: 'rule_switch',
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    isConditional,
    activeModifier,
    activeRuleName,
    rulePrompt,
    options: shuffle(options),
    correctOptionId: correctOption.id,
    instructionText: isConditional ? 'FOLLOW COLOR CONDITION' : 'APPLY ACTIVE RULE',
    actionPrompt: rulePrompt,
    createdAt: Date.now(),
  };
}

export default {
  generateRuleSwitchTask,
};
