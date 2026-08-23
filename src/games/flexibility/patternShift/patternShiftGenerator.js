/**
 * OVERLOAD - Pattern Shift Task Generator
 * Procedural generation of mid-sequence structural rule transitions.
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

export function generatePatternShiftTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[FLEXIBILITY_MODES.PATTERN_SHIFT]?.[level] || 7000;
  const taskId = `pat_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const colors = ATTRIBUTE_TOKENS.colors;
  const shapes = ATTRIBUTE_TOKENS.shapes;

  // Choose transition archetype
  const archetypes = ['ALT_TO_REPEAT', 'REPEAT_TO_ALT', 'SHAPE_ALT_TO_COLOR_RUN'];
  const archetype = pickRandom(archetypes);

  let sequenceItems = [];
  let correctItem = null;
  let distractorItems = [];

  const c1 = colors[0];
  const c2 = colors[1];
  const c3 = colors[2];
  const s1 = shapes[0];
  const s2 = shapes[1];
  const s3 = shapes[2];

  if (archetype === 'ALT_TO_REPEAT') {
    // Part 1: Alternating [C1, C2, C1, C2]
    // Part 2 (Shifted): Repeated [C3, C3, C3, ?] -> correct answer: C3
    sequenceItems = [
      { id: '1', color: c1.hex, icon: s1.icon, label: `${c1.name} ${s1.name}` },
      { id: '2', color: c2.hex, icon: s1.icon, label: `${c2.name} ${s1.name}` },
      { id: '3', color: c1.hex, icon: s1.icon, label: `${c1.name} ${s1.name}` },
      { id: '4', color: c2.hex, icon: s1.icon, label: `${c2.name} ${s1.name}` },
      { id: '5', color: c3.hex, icon: s1.icon, label: `${c3.name} ${s1.name}` },
      { id: '6', color: c3.hex, icon: s1.icon, label: `${c3.name} ${s1.name}` },
      { id: '7', color: c3.hex, icon: s1.icon, label: `${c3.name} ${s1.name}` },
    ];
    correctItem = { color: c3.hex, icon: s1.icon, label: `${c3.name} ${s1.name}` };
    distractorItems = [
      { color: c1.hex, icon: s1.icon, label: `${c1.name} ${s1.name}` },
      { color: c2.hex, icon: s1.icon, label: `${c2.name} ${s1.name}` },
      { color: c3.hex, icon: s2.icon, label: `${c3.name} ${s2.name}` },
    ];
  } else if (archetype === 'REPEAT_TO_ALT') {
    // Part 1: Repeated [C1, C1, C1, C1]
    // Part 2 (Shifted): Alternating [C2, C3, C2, ?] -> correct answer: C3
    sequenceItems = [
      { id: '1', color: c1.hex, icon: s1.icon, label: `${c1.name} ${s1.name}` },
      { id: '2', color: c1.hex, icon: s1.icon, label: `${c1.name} ${s1.name}` },
      { id: '3', color: c1.hex, icon: s1.icon, label: `${c1.name} ${s1.name}` },
      { id: '4', color: c2.hex, icon: s1.icon, label: `${c2.name} ${s1.name}` },
      { id: '5', color: c3.hex, icon: s1.icon, label: `${c3.name} ${s1.name}` },
      { id: '6', color: c2.hex, icon: s1.icon, label: `${c2.name} ${s1.name}` },
    ];
    correctItem = { color: c3.hex, icon: s1.icon, label: `${c3.name} ${s1.name}` };
    distractorItems = [
      { color: c1.hex, icon: s1.icon, label: `${c1.name} ${s1.name}` },
      { color: c2.hex, icon: s1.icon, label: `${c2.name} ${s1.name}` },
      { color: c1.hex, icon: s2.icon, label: `${c1.name} ${s2.name}` },
    ];
  } else {
    // Shape Alt to Shape Run
    // Part 1: [S1, S2, S1, S2]
    // Part 2 (Shifted): [S3, S3, S3, ?] -> correct answer: S3
    sequenceItems = [
      { id: '1', color: c1.hex, icon: s1.icon, label: `${c1.name} ${s1.name}` },
      { id: '2', color: c1.hex, icon: s2.icon, label: `${c1.name} ${s2.name}` },
      { id: '3', color: c1.hex, icon: s1.icon, label: `${c1.name} ${s1.name}` },
      { id: '4', color: c1.hex, icon: s3.icon, label: `${c1.name} ${s3.name}` },
      { id: '5', color: c1.hex, icon: s3.icon, label: `${c1.name} ${s3.name}` },
    ];
    correctItem = { color: c1.hex, icon: s3.icon, label: `${c1.name} ${s3.name}` };
    distractorItems = [
      { color: c1.hex, icon: s1.icon, label: `${c1.name} ${s1.name}` },
      { color: c1.hex, icon: s2.icon, label: `${c1.name} ${s2.name}` },
      { color: c2.hex, icon: s3.icon, label: `${c2.name} ${s3.name}` },
    ];
  }

  const optionPool = [
    { id: 'opt_correct', isMatch: true, ...correctItem },
    ...distractorItems.map((d, i) => ({ id: `opt_dist_${i}`, isMatch: false, ...d })),
  ];

  const shuffledOptions = shuffle(optionPool).map((opt, idx) => ({
    id: `opt_${idx}`,
    letter: String.fromCharCode(65 + idx),
    color: opt.color,
    icon: opt.icon,
    label: opt.label,
    isTrueMatch: opt.isMatch,
  }));

  const correctOption = shuffledOptions.find((o) => o.isTrueMatch) || shuffledOptions[0];

  return {
    taskId,
    mode: FLEXIBILITY_MODES.PATTERN_SHIFT,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    sequence: sequenceItems,
    options: shuffledOptions,
    correctOptionId: correctOption.id,
    correctOptionLetter: correctOption.letter,
    instructionText: 'IDENTIFY SHIFTED PATTERN',
    actionPrompt: 'SELECT NEXT SYMBOL FOLLOWING NEW RULE',
    createdAt: Date.now(),
  };
}

export default {
  generatePatternShiftTask,
};
