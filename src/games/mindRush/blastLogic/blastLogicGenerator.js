/**
 * OVERLOAD - Blast Logic Task Generator & Validator
 * Robust procedural generation of fast-paced target blasting with multi-attribute rules.
 */

import { MIND_RUSH_MODES, TIMEOUT_WINDOWS_MS } from '../mindRushConstants.js';

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

export const COLORS = [
  { id: 'red', name: 'RED', hex: '#EF4444' },
  { id: 'blue', name: 'BLUE', hex: '#3B82F6' },
  { id: 'green', name: 'GREEN', hex: '#10B981' },
  { id: 'gold', name: 'GOLD', hex: '#F59E0B' },
];

export const SHAPES = [
  { id: 'circle', name: 'CIRCLE', icon: 'ellipse' },
  { id: 'square', name: 'SQUARE', icon: 'square' },
  { id: 'triangle', name: 'TRIANGLE', icon: 'triangle' },
  { id: 'star', name: 'STAR', icon: 'star' },
];

/**
 * Validates a Blast Logic task to ensure strict data integrity before display.
 */
export function validateBlastLogicTask(task) {
  if (!task || typeof task !== 'object') return false;
  if (!task.id && !task.taskId) return false;
  if (!task.rule && !task.ruleText) return false;
  if (!Array.isArray(task.targets) || task.targets.length !== 4) return false;

  const targetIds = new Set();
  const targetValues = new Set();
  let correctCount = 0;
  let distractorCount = 0;

  for (const t of task.targets) {
    if (!t || typeof t !== 'object') return false;
    if (!t.id || typeof t.id !== 'string') return false;
    if (targetIds.has(t.id)) return false; // Duplicate ID
    targetIds.add(t.id);

    const val = t.value !== undefined ? t.value : t.number;
    if (typeof val !== 'number' || isNaN(val)) return false;
    if (targetValues.has(val)) return false; // Duplicate number
    targetValues.add(val);

    if (!t.color || typeof t.color.hex !== 'string' || !t.color.id) return false;
    if (!t.shape || typeof t.shape.icon !== 'string' || !t.shape.id) return false;

    if (t.isMatch === true) correctCount++;
    else if (t.isMatch === false) distractorCount++;
    else return false;
  }

  if (correctCount !== 1 || distractorCount !== 3) return false;

  const validTarget = task.targets.find((t) => t.isMatch);
  if (!validTarget || task.correctTargetId !== validTarget.id) return false;

  return true;
}

/**
 * Generates a validated Blast Logic task.
 */
export function generateBlastLogicTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[MIND_RUSH_MODES.BLAST_LOGIC]?.[level] || 7500;

  for (let attempt = 0; attempt < 20; attempt++) {
    const randSuffix = `${Date.now()}_${attempt}_${Math.random().toString(36).substring(2, 6)}`;
    const taskId = `blast_r${roundNumber}_${randSuffix}`;

    // Select rule archetype based on difficulty
    const ruleTypes = ['DIVISIBLE_3', 'EVEN_NUMBERS', 'ODD_NUMBERS', 'GREATER_50', 'LESS_40', 'COLOR_MATCH', 'SHAPE_MATCH'];
    if (level >= 4) {
      ruleTypes.push('DIVISIBLE_5');
    }
    if (level >= 5) {
      ruleTypes.push('COMBINATION');
    }

    const selectedRuleType = pickRandom(ruleTypes);
    let ruleText = '';
    let validator = null;

    if (selectedRuleType === 'DIVISIBLE_3') {
      ruleText = 'BLAST NUMBERS DIVISIBLE BY 3';
      validator = (t) => t.value % 3 === 0;
    } else if (selectedRuleType === 'DIVISIBLE_5') {
      ruleText = 'BLAST NUMBERS DIVISIBLE BY 5';
      validator = (t) => t.value % 5 === 0;
    } else if (selectedRuleType === 'EVEN_NUMBERS') {
      ruleText = 'BLAST EVEN NUMBERS';
      validator = (t) => t.value % 2 === 0;
    } else if (selectedRuleType === 'ODD_NUMBERS') {
      ruleText = 'BLAST ODD NUMBERS';
      validator = (t) => t.value % 2 !== 0;
    } else if (selectedRuleType === 'GREATER_50') {
      ruleText = 'BLAST NUMBERS GREATER THAN 50';
      validator = (t) => t.value > 50;
    } else if (selectedRuleType === 'LESS_40') {
      ruleText = 'BLAST NUMBERS LESS THAN 40';
      validator = (t) => t.value < 40;
    } else if (selectedRuleType === 'COLOR_MATCH') {
      const targetColor = pickRandom(COLORS);
      ruleText = `BLAST ${targetColor.name} TARGETS`;
      validator = (t) => t.color.id === targetColor.id;
    } else if (selectedRuleType === 'SHAPE_MATCH') {
      const targetShape = pickRandom(SHAPES);
      ruleText = `BLAST ${targetShape.name} TARGETS`;
      validator = (t) => t.shape.id === targetShape.id;
    } else {
      // COMBINATION
      const targetColor = pickRandom(COLORS);
      ruleText = `BLAST ${targetColor.name} NUMBERS > 30`;
      validator = (t) => t.color.id === targetColor.id && t.value > 30;
    }

    const usedNumbers = new Set();
    let correctTarget = null;
    const distractors = [];

    // Generate 1 valid target
    let valAttempts = 0;
    while (!correctTarget && valAttempts < 100) {
      valAttempts++;
      const num = Math.floor(10 + Math.random() * 89);
      const cand = {
        value: num,
        number: num,
        color: pickRandom(COLORS),
        shape: pickRandom(SHAPES),
      };
      if (validator(cand) && !usedNumbers.has(num)) {
        usedNumbers.add(num);
        correctTarget = {
          id: `t_corr_${randSuffix}`,
          value: num,
          number: num,
          color: cand.color,
          shape: cand.shape,
          isMatch: true,
        };
      }
    }

    // Generate 3 invalid distractors
    let distAttempts = 0;
    while (distractors.length < 3 && distAttempts < 200) {
      distAttempts++;
      const num = Math.floor(10 + Math.random() * 89);
      const cand = {
        value: num,
        number: num,
        color: pickRandom(COLORS),
        shape: pickRandom(SHAPES),
      };
      if (!validator(cand) && !usedNumbers.has(num)) {
        usedNumbers.add(num);
        distractors.push({
          id: `t_dist_${distractors.length}_${randSuffix}`,
          value: num,
          number: num,
          color: cand.color,
          shape: cand.shape,
          isMatch: false,
        });
      }
    }

    if (correctTarget && distractors.length === 3) {
      const allTargets = shuffle([correctTarget, ...distractors]);
      const task = {
        id: taskId,
        taskId,
        mode: MIND_RUSH_MODES.BLAST_LOGIC,
        difficulty: level,
        difficultyLevel: level,
        roundNumber,
        timeoutWindowMs,
        rule: ruleText,
        ruleText,
        targets: allTargets,
        correctTargetId: correctTarget.id,
        correctTargetIds: [correctTarget.id],
        instructionText: 'BLAST MATCHING TARGET',
        actionPrompt: ruleText,
        createdAt: Date.now(),
      };

      if (validateBlastLogicTask(task)) {
        return task;
      }
    }
  }

  // Deterministic safe fallback
  const fallbackTaskId = `blast_fallback_${Date.now()}`;
  const fallbackCorrect = {
    id: `t_c_${fallbackTaskId}`,
    value: 24,
    number: 24,
    color: COLORS[0],
    shape: SHAPES[0],
    isMatch: true,
  };
  const fallbackDistractors = [
    { id: `t_d1_${fallbackTaskId}`, value: 17, number: 17, color: COLORS[1], shape: SHAPES[1], isMatch: false },
    { id: `t_d2_${fallbackTaskId}`, value: 35, number: 35, color: COLORS[2], shape: SHAPES[2], isMatch: false },
    { id: `t_d3_${fallbackTaskId}`, value: 49, number: 49, color: COLORS[3], shape: SHAPES[3], isMatch: false },
  ];
  const fallbackTargets = shuffle([fallbackCorrect, ...fallbackDistractors]);

  return {
    id: fallbackTaskId,
    taskId: fallbackTaskId,
    mode: MIND_RUSH_MODES.BLAST_LOGIC,
    difficulty: level,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    rule: 'BLAST EVEN NUMBERS',
    ruleText: 'BLAST EVEN NUMBERS',
    targets: fallbackTargets,
    correctTargetId: fallbackCorrect.id,
    correctTargetIds: [fallbackCorrect.id],
    instructionText: 'BLAST MATCHING TARGET',
    actionPrompt: 'BLAST EVEN NUMBERS',
    createdAt: Date.now(),
  };
}

export default {
  COLORS,
  SHAPES,
  validateBlastLogicTask,
  generateBlastLogicTask,
};
