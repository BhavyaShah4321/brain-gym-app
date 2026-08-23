/**
 * OVERLOAD - Sequence Logic Task Generator
 * Procedural generation of mathematical and inductive sequence transformation rules.
 */

import { LOGIC_MODES, TIMEOUT_WINDOWS_MS } from '../logicConstants.js';

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

export function generateSequenceLogicTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[LOGIC_MODES.SEQUENCE_LOGIC]?.[level] || 10000;
  const taskId = `seq_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Available rule archetypes based on difficulty
  const archetypes = ['ARITHMETIC'];
  if (level >= 2) archetypes.push('GEOMETRIC');
  if (level >= 4) archetypes.push('INCREASING_DIFF');
  if (level >= 6) archetypes.push('ALTERNATING');
  if (level >= 8) archetypes.push('FIBONACCI');

  const archetype = pickRandom(archetypes);

  let sequence = [];
  let nextValue = 0;
  let ruleDescription = '';

  if (archetype === 'ARITHMETIC') {
    const start = Math.floor(2 + Math.random() * 15);
    const diff = Math.floor(2 + Math.random() * 7);
    sequence = [start, start + diff, start + 2 * diff, start + 3 * diff, start + 4 * diff];
    nextValue = start + 5 * diff;
    ruleDescription = `Add ${diff} each step`;
  } else if (archetype === 'GEOMETRIC') {
    const start = Math.floor(1 + Math.random() * 4);
    const ratio = Math.floor(2 + Math.random() * 2); // 2 or 3
    sequence = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio];
    nextValue = sequence[sequence.length - 1] * ratio;
    ruleDescription = `Multiply by ${ratio}`;
  } else if (archetype === 'INCREASING_DIFF') {
    const start = Math.floor(1 + Math.random() * 10);
    const baseDiff = Math.floor(1 + Math.random() * 3);
    let curr = start;
    sequence = [curr];
    for (let i = 0; i < 4; i++) {
      curr += baseDiff + i * 2;
      sequence.push(curr);
    }
    nextValue = curr + (baseDiff + 4 * 2);
    ruleDescription = 'Differences increase by 2';
  } else if (archetype === 'ALTERNATING') {
    const start = Math.floor(2 + Math.random() * 6);
    const addVal = 3;
    const multVal = 2;
    sequence = [
      start,
      start + addVal,
      (start + addVal) * multVal,
      (start + addVal) * multVal + addVal,
      ((start + addVal) * multVal + addVal) * multVal,
    ];
    nextValue = sequence[sequence.length - 1] + addVal;
    ruleDescription = `Alternate +${addVal} and ×${multVal}`;
  } else {
    // FIBONACCI
    const a = Math.floor(1 + Math.random() * 3);
    const b = Math.floor(2 + Math.random() * 4);
    sequence = [a, b, a + b, a + 2 * b, 2 * a + 3 * b];
    nextValue = sequence[sequence.length - 1] + sequence[sequence.length - 2];
    ruleDescription = 'Sum of previous two numbers';
  }

  // Generate plausible numerical distractors
  const distractors = new Set();
  const offsets = [1, -1, 2, -2, 4, -3, 5, 10];

  while (distractors.size < 3) {
    const off = pickRandom(offsets);
    const candidate = nextValue + off;
    if (candidate > 0 && candidate !== nextValue) {
      distractors.add(candidate);
    }
  }

  const optionPool = [
    { id: `opt_corr_${nextValue}`, value: nextValue, isCorrect: true },
    ...Array.from(distractors).map((d, i) => ({
      id: `opt_dist_${i}_${d}`,
      value: d,
      isCorrect: false,
    })),
  ];

  const shuffledOptions = shuffle(optionPool).map((opt, idx) => ({
    id: opt.id,
    letter: String.fromCharCode(65 + idx),
    value: opt.value,
    label: `${opt.value}`,
    isCorrect: opt.isCorrect,
  }));

  const correctOption = shuffledOptions.find((o) => o.isCorrect) || shuffledOptions[0];

  return {
    taskId,
    mode: LOGIC_MODES.SEQUENCE_LOGIC,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    sequence,
    nextValue,
    ruleDescription,
    options: shuffledOptions,
    correctOptionId: correctOption.id,
    correctOptionLetter: correctOption.letter,
    instructionText: 'IDENTIFY TRANSFORMATION RULE',
    actionPrompt: 'WHAT IS THE NEXT VALUE IN THE SEQUENCE?',
    createdAt: Date.now(),
  };
}

export default {
  generateSequenceLogicTask,
};
