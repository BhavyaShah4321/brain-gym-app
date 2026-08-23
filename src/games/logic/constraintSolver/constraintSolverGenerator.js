/**
 * OVERLOAD - Constraint Solver Task Generator
 * Procedural generation of multi-constraint satisfaction problems with single-answer validation.
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

export function generateConstraintSolverTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[LOGIC_MODES.CONSTRAINT_SOLVER]?.[level] || 12000;
  const taskId = `con_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  let attempts = 0;
  while (attempts < 50) {
    attempts++;

    // Pick bounds
    const minVal = Math.floor(10 + Math.random() * 20);
    const maxVal = minVal + Math.floor(25 + Math.random() * 25);
    const divisor = pickRandom([3, 4, 5, 6]);
    const parity = pickRandom(['EVEN', 'ODD']);

    const constraints = [
      { id: 'c_gt', text: `Greater than ${minVal}`, test: (n) => n > minVal },
      { id: 'c_lt', text: `Less than ${maxVal}`, test: (n) => n < maxVal },
      {
        id: 'c_par',
        text: parity === 'EVEN' ? 'Must be an even number' : 'Must be an odd number',
        test: (n) => (parity === 'EVEN' ? n % 2 === 0 : n % 2 !== 0),
      },
      {
        id: 'c_div',
        text: `Divisible by ${divisor}`,
        test: (n) => n % divisor === 0,
      },
    ];

    if (level >= 6) {
      const digitSumParity = pickRandom(['EVEN', 'ODD']);
      constraints.push({
        id: 'c_dsum',
        text: `Sum of digits is ${digitSumParity}`,
        test: (n) => {
          const sum = `${n}`.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
          return digitSumParity === 'EVEN' ? sum % 2 === 0 : sum % 2 !== 0;
        },
      });
    }

    // Find all numbers between 1 and 100 that satisfy all constraints
    const validNumbers = [];
    for (let n = 1; n <= 100; n++) {
      if (constraints.every((c) => c.test(n))) {
        validNumbers.push(n);
      }
    }

    if (validNumbers.length >= 1) {
      const correctNumber = pickRandom(validNumbers);

      // Generate distractors that fail at least one constraint
      const distractors = new Set();
      let distAttempts = 0;
      while (distractors.size < 3 && distAttempts < 100) {
        distAttempts++;
        const candidate = Math.floor(1 + Math.random() * 100);
        // Candidate must NOT satisfy all constraints
        const satisfiesAll = constraints.every((c) => c.test(candidate));
        if (!satisfiesAll && candidate !== correctNumber) {
          distractors.add(candidate);
        }
      }

      if (distractors.size === 3) {
        const optionPool = [
          { id: `opt_corr_${correctNumber}`, value: correctNumber, isCorrect: true },
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
          mode: LOGIC_MODES.CONSTRAINT_SOLVER,
          difficultyLevel: level,
          roundNumber,
          timeoutWindowMs,
          constraints: constraints.map((c) => ({ id: c.id, text: c.text })),
          options: shuffledOptions,
          correctOptionId: correctOption.id,
          correctOptionLetter: correctOption.letter,
          correctValue: correctNumber,
          instructionText: 'SATISFY ALL CONSTRAINTS',
          actionPrompt: 'SELECT THE ONLY NUMBER THAT FULFILLS ALL CONDITIONS',
          createdAt: Date.now(),
        };
      }
    }
  }

  // Safe fallback
  return {
    taskId,
    mode: LOGIC_MODES.CONSTRAINT_SOLVER,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    constraints: [
      { id: 'c1', text: 'Greater than 20' },
      { id: 'c2', text: 'Less than 40' },
      { id: 'c3', text: 'Must be an even number' },
      { id: 'c4', text: 'Divisible by 3' },
    ],
    options: [
      { id: 'opt_18', letter: 'A', value: 18, label: '18', isCorrect: false },
      { id: 'opt_24', letter: 'B', value: 24, label: '24', isCorrect: true },
      { id: 'opt_27', letter: 'C', value: 27, label: '27', isCorrect: false },
      { id: 'opt_35', letter: 'D', value: 35, label: '35', isCorrect: false },
    ],
    correctOptionId: 'opt_24',
    correctOptionLetter: 'B',
    correctValue: 24,
    instructionText: 'SATISFY ALL CONSTRAINTS',
    actionPrompt: 'SELECT THE ONLY NUMBER THAT FULFILLS ALL CONDITIONS',
    createdAt: Date.now(),
  };
}

export default {
  generateConstraintSolverTask,
};
