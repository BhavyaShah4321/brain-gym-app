/**
 * OVERLOAD - Pattern Complete Task Generator
 * Procedural generation for logically sound, unambiguous visual sequence patterns.
 */

import {
  PROCESSING_MODES,
  PROCESSING_SHAPES,
  TIMEOUT_WINDOWS_MS,
} from '../processingConstants.js';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function generatePatternCompleteTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[PROCESSING_MODES.PATTERN_COMPLETE][level] || 4500;
  const taskId = `pattern_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Pattern families available based on level
  const patternTypes = ['alternating', 'cyclic_shapes'];
  if (level >= 3) patternTypes.push('repetition', 'numeric_increment');
  if (level >= 6) patternTypes.push('numeric_decrement', 'interleaved');

  const chosenType = pickRandom(patternTypes);
  const shuffledShapes = shuffle(PROCESSING_SHAPES);

  let sequenceItems = [];
  let correctTarget = null;
  let distractorPool = [];

  if (chosenType === 'alternating') {
    // A -> B -> A -> B -> ? (Answer: A)
    const shapeA = shuffledShapes[0];
    const shapeB = shuffledShapes[1];
    sequenceItems = [
      { id: '1', display: shapeA.symbol, name: shapeA.name },
      { id: '2', display: shapeB.symbol, name: shapeB.name },
      { id: '3', display: shapeA.symbol, name: shapeA.name },
      { id: '4', display: shapeB.symbol, name: shapeB.name },
    ];
    correctTarget = { display: shapeA.symbol, name: shapeA.name };
    distractorPool = shuffledShapes.slice(1).map((s) => ({ display: s.symbol, name: s.name }));
  } else if (chosenType === 'repetition') {
    // A -> A -> B -> A -> A -> ? (Answer: B)
    const shapeA = shuffledShapes[0];
    const shapeB = shuffledShapes[1];
    sequenceItems = [
      { id: '1', display: shapeA.symbol, name: shapeA.name },
      { id: '2', display: shapeA.symbol, name: shapeA.name },
      { id: '3', display: shapeB.symbol, name: shapeB.name },
      { id: '4', display: shapeA.symbol, name: shapeA.name },
      { id: '5', display: shapeA.symbol, name: shapeA.name },
    ];
    correctTarget = { display: shapeB.symbol, name: shapeB.name };
    distractorPool = [shapeA, ...shuffledShapes.slice(2)].map((s) => ({ display: s.symbol, name: s.name }));
  } else if (chosenType === 'numeric_increment') {
    // start -> +1 -> +2 -> +3 -> ?
    const startNum = Math.floor(Math.random() * 5) + 1;
    sequenceItems = [
      { id: '1', display: `${startNum}` },
      { id: '2', display: `${startNum + 1}` },
      { id: '3', display: `${startNum + 2}` },
      { id: '4', display: `${startNum + 3}` },
    ];
    const ansNum = startNum + 4;
    correctTarget = { display: `${ansNum}` };
    distractorPool = [ansNum - 1, ansNum + 1, ansNum + 2, ansNum - 2].map((n) => ({ display: `${n}` }));
  } else if (chosenType === 'numeric_decrement') {
    // start -> -1 -> -2 -> -3 -> ?
    const startNum = Math.floor(Math.random() * 4) + 6; // 6 to 9
    sequenceItems = [
      { id: '1', display: `${startNum}` },
      { id: '2', display: `${startNum - 1}` },
      { id: '3', display: `${startNum - 2}` },
      { id: '4', display: `${startNum - 3}` },
    ];
    const ansNum = startNum - 4;
    correctTarget = { display: `${ansNum}` };
    distractorPool = [ansNum + 1, ansNum - 1, ansNum + 2, ansNum + 3].map((n) => ({ display: `${n}` }));
  } else if (chosenType === 'interleaved') {
    // A -> 1 -> B -> 2 -> C -> ? (Answer: 3)
    const shapeA = shuffledShapes[0];
    const shapeB = shuffledShapes[1];
    const shapeC = shuffledShapes[2];
    sequenceItems = [
      { id: '1', display: shapeA.symbol },
      { id: '2', display: '1' },
      { id: '3', display: shapeB.symbol },
      { id: '4', display: '2' },
      { id: '5', display: shapeC.symbol },
    ];
    correctTarget = { display: '3' };
    distractorPool = [{ display: '4' }, { display: '2' }, { display: shuffledShapes[3].symbol }, { display: '1' }];
  } else {
    // cyclic_shapes: A -> B -> C -> A -> B -> ? (Answer: C)
    const shapeA = shuffledShapes[0];
    const shapeB = shuffledShapes[1];
    const shapeC = shuffledShapes[2];
    sequenceItems = [
      { id: '1', display: shapeA.symbol, name: shapeA.name },
      { id: '2', display: shapeB.symbol, name: shapeB.name },
      { id: '3', display: shapeC.symbol, name: shapeC.name },
      { id: '4', display: shapeA.symbol, name: shapeA.name },
      { id: '5', display: shapeB.symbol, name: shapeB.name },
    ];
    correctTarget = { display: shapeC.symbol, name: shapeC.name };
    distractorPool = [shapeA, shapeB, ...shuffledShapes.slice(3)].map((s) => ({ display: s.symbol, name: s.name }));
  }

  // Create 4 distinct choices
  const uniqueDistractors = distractorPool.filter((d) => d.display !== correctTarget.display);
  const chosenDistractors = shuffle(uniqueDistractors).slice(0, 3);
  const choices = shuffle([correctTarget, ...chosenDistractors]);
  const correctAnswerIndex = choices.findIndex((c) => c.display === correctTarget.display);

  return {
    taskId,
    mode: PROCESSING_MODES.PATTERN_COMPLETE,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    patternType: chosenType,
    sequenceItems,
    choices,
    correctAnswerIndex,
    correctTarget,
    instructionText: 'COMPLETE THE SEQUENCE',
    actionPrompt: 'WHAT COMES NEXT (?)',
    createdAt: Date.now(),
  };
}

export default {
  generatePatternCompleteTask,
};
