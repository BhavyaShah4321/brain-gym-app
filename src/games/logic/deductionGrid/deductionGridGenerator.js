/**
 * OVERLOAD - Deduction Grid Task Generator
 * Procedural generation for deductive logic puzzles with deterministic single-solution validation.
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

const PEOPLE_POOL = ['Alex', 'Ben', 'Charlie', 'Dana'];
const COLORS_POOL = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Gold', hex: '#F59E0B' },
];
const ROLES_POOL = ['Leader', 'Designer', 'Engineer', 'Analyst'];

/**
 * Validates that the clue set allows exactly one unique assignment.
 */
function solveDeductionGrid(people, colors, clues) {
  // Test all possible permutations of colors assigned to people
  const generatePermutations = (arr) => {
    if (arr.length <= 1) return [arr];
    const perms = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const p of generatePermutations(rest)) {
        perms.push([arr[i], ...p]);
      }
    }
    return perms;
  };

  const allColorPerms = generatePermutations(colors.map((c) => c.name));
  const validAssignments = [];

  for (const perm of allColorPerms) {
    const assignment = {};
    people.forEach((p, idx) => {
      assignment[p] = perm[idx];
    });

    let isValid = true;
    for (const clue of clues) {
      if (clue.type === 'DIRECT' && assignment[clue.person] !== clue.color) {
        isValid = false;
        break;
      }
      if (clue.type === 'NEGATIVE' && assignment[clue.person] === clue.color) {
        isValid = false;
        break;
      }
      if (clue.type === 'EQUALITY' && assignment[clue.personA] !== assignment[clue.personB]) {
        isValid = false;
        break;
      }
    }

    if (isValid) {
      validAssignments.push(assignment);
    }
  }

  return validAssignments;
}

export function generateDeductionGridTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[LOGIC_MODES.DEDUCTION_GRID]?.[level] || 15000;
  const taskId = `ded_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const numEntities = level <= 3 ? 3 : level <= 7 ? 3 : 4;
  const people = PEOPLE_POOL.slice(0, numEntities);
  const colors = COLORS_POOL.slice(0, numEntities);

  let attempts = 0;
  while (attempts < 50) {
    attempts++;

    // Ground truth assignment: random 1-to-1 matching
    const shuffledColors = shuffle(colors);
    const groundTruth = {};
    people.forEach((person, idx) => {
      groundTruth[person] = shuffledColors[idx].name;
    });

    // Generate clues based on ground truth
    const clues = [];

    // Clue 1: Direct match for person 0
    clues.push({
      type: 'DIRECT',
      person: people[0],
      color: groundTruth[people[0]],
      text: `${people[0]} is assigned the ${groundTruth[people[0]]} color.`,
    });

    // Clue 2: Negative clue for person 1
    const wrongColorForP1 = colors.find((c) => c.name !== groundTruth[people[1]])?.name || colors[0].name;
    clues.push({
      type: 'NEGATIVE',
      person: people[1],
      color: wrongColorForP1,
      text: `${people[1]} does NOT have the ${wrongColorForP1} color.`,
    });

    // Clue 3: Direct or negative clue for person 2
    if (numEntities >= 3) {
      const wrongColorForP2 = colors.find(
        (c) => c.name !== groundTruth[people[2]] && c.name !== groundTruth[people[0]]
      )?.name || colors[1].name;
      clues.push({
        type: 'NEGATIVE',
        person: people[2],
        color: wrongColorForP2,
        text: `${people[2]} does NOT have the ${wrongColorForP2} color.`,
      });
    }

    // Additional clues for higher levels
    if (numEntities >= 4) {
      clues.push({
        type: 'DIRECT',
        person: people[3],
        color: groundTruth[people[3]],
        text: `${people[3]} is assigned the ${groundTruth[people[3]]} color.`,
      });
    }

    // Check solution count with deterministic solver
    const solutions = solveDeductionGrid(people, colors, clues);

    if (solutions.length === 1) {
      // Pick a target question
      const targetPerson = pickRandom(people);
      const correctColor = groundTruth[targetPerson];

      const options = colors.map((c) => ({
        id: `opt_${c.name.toLowerCase()}`,
        label: c.name,
        hex: c.hex,
        isCorrect: c.name === correctColor,
      }));

      const correctOption = options.find((o) => o.isCorrect) || options[0];

      return {
        taskId,
        mode: LOGIC_MODES.DEDUCTION_GRID,
        difficultyLevel: level,
        roundNumber,
        timeoutWindowMs,
        people,
        colors,
        clues: shuffle(clues),
        targetQuestion: `What color is assigned to ${targetPerson}?`,
        targetPerson,
        correctAnswer: correctColor,
        options: shuffle(options),
        correctOptionId: correctOption.id,
        instructionText: 'DEDUCE FROM CLUES',
        actionPrompt: `DEDUCE THE COLOR FOR ${targetPerson.toUpperCase()}`,
        createdAt: Date.now(),
      };
    }
  }

  // Safe fallback
  const fallbackPeople = ['Alex', 'Ben', 'Charlie'];
  const fallbackColors = COLORS_POOL.slice(0, 3);
  const fallbackClues = [
    { type: 'DIRECT', text: 'Alex is assigned the Red color.' },
    { type: 'NEGATIVE', text: 'Ben does NOT have the Green color.' },
    { type: 'NEGATIVE', text: 'Charlie does NOT have the Blue color.' },
  ];

  return {
    taskId,
    mode: LOGIC_MODES.DEDUCTION_GRID,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    people: fallbackPeople,
    colors: fallbackColors,
    clues: fallbackClues,
    targetQuestion: 'What color is assigned to Ben?',
    targetPerson: 'Ben',
    correctAnswer: 'Blue',
    options: [
      { id: 'opt_red', label: 'Red', hex: '#EF4444', isCorrect: false },
      { id: 'opt_blue', label: 'Blue', hex: '#3B82F6', isCorrect: true },
      { id: 'opt_green', label: 'Green', hex: '#10B981', isCorrect: false },
    ],
    correctOptionId: 'opt_blue',
    instructionText: 'DEDUCE FROM CLUES',
    actionPrompt: 'DEDUCE THE COLOR FOR BEN',
    createdAt: Date.now(),
  };
}

export default {
  generateDeductionGridTask,
};
