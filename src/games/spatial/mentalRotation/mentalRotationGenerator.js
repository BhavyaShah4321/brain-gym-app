/**
 * OVERLOAD - Mental Rotation Task Generator
 * Procedural generation of 2D geometric polyomino shapes with mathematically verified rotations
 * and non-equivalent chiral/mutated distractors.
 */

import { SPATIAL_MODES, TIMEOUT_WINDOWS_MS } from '../spatialConstants.js';

// Base 3x3 asymmetric geometric shape matrices
const BASE_SHAPES_3X3 = [
  // L-shape with hook
  [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  // F-pentomino shape
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 1, 0],
  ],
  // Asymmetric T / Gun shape
  [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 1],
  ],
  // Z-hook shape
  [
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ],
  // Corner step
  [
    [1, 1, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  // Asymmetric U
  [
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 0],
  ],
];

// Rotate matrix 90 degrees clockwise
function rotate90(matrix) {
  const n = matrix.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

function rotate180(matrix) {
  return rotate90(rotate90(matrix));
}

function rotate270(matrix) {
  return rotate90(rotate180(matrix));
}

// Horizontal reflection (mirroring)
function mirrorHorizontal(matrix) {
  const n = matrix.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[r][n - 1 - c] = matrix[r][c];
    }
  }
  return result;
}

// Convert matrix to binary signature string for exact comparison
function matrixToSignature(matrix) {
  return matrix.map((row) => row.join('')).join('-');
}

// Mutate shape slightly (toggle 1 cell) to create structural distractor
function mutateShape(matrix) {
  const n = matrix.length;
  const copy = matrix.map((row) => [...row]);
  const r = Math.floor(Math.random() * n);
  const c = Math.floor(Math.random() * n);
  copy[r][c] = copy[r][c] === 1 ? 0 : 1;
  return copy;
}

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

export function generateMentalRotationTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[SPATIAL_MODES.MENTAL_ROTATION]?.[level] || 7500;
  const taskId = `rot_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const optionCount = level <= 3 ? 3 : 4;

  let attempts = 0;
  while (attempts < 50) {
    attempts++;
    const baseTarget = pickRandom(BASE_SHAPES_3X3);

    // Compute all 4 valid 2D rotations
    const rot0 = baseTarget;
    const rot90 = rotate90(baseTarget);
    const rot180 = rotate180(baseTarget);
    const rot270 = rotate270(baseTarget);

    const validRotations = [
      { angle: 90, matrix: rot90 },
      { angle: 180, matrix: rot180 },
      { angle: 270, matrix: rot270 },
    ];

    const targetSignature = matrixToSignature(rot0);
    const validSignatures = new Set([
      matrixToSignature(rot90),
      matrixToSignature(rot180),
      matrixToSignature(rot270),
    ]);

    // Choose one true rotated version as the correct answer
    const chosenRotation = pickRandom(validRotations);
    const correctMatrix = chosenRotation.matrix;

    // Distractor 1: Mirrored version (chiral inversion - cannot be matched via rigid 2D rotation)
    const mirroredTarget = mirrorHorizontal(baseTarget);
    const mirroredRotations = [
      mirroredTarget,
      rotate90(mirroredTarget),
      rotate180(mirroredTarget),
      rotate270(mirroredTarget),
    ];
    const distractorMirror = pickRandom(mirroredRotations);

    // Distractor 2: Structural mutation
    const distractorMutated = mutateShape(rotate90(baseTarget));

    // Distractor 3: Another structural mutation or flipped shape
    const distractorMutated2 = mutateShape(rotate270(baseTarget));

    const candidatePool = [
      { id: 'opt_correct', matrix: correctMatrix, isCorrect: true },
      { id: 'opt_dist_mirror', matrix: distractorMirror, isCorrect: false },
      { id: 'opt_dist_mut1', matrix: distractorMutated, isCorrect: false },
    ];

    if (optionCount >= 4) {
      candidatePool.push({ id: 'opt_dist_mut2', matrix: distractorMutated2, isCorrect: false });
    }

    // Uniqueness & Ambiguity Validation Guard:
    // Ensure all candidate options have unique signatures and only 1 matches a valid rotation
    const signaturesSeen = new Set();
    let isUnique = true;
    let matchingCorrectCount = 0;

    for (const opt of candidatePool) {
      const sig = matrixToSignature(opt.matrix);
      if (signaturesSeen.has(sig) || sig === targetSignature) {
        isUnique = false;
        break;
      }
      signaturesSeen.add(sig);

      if (validSignatures.has(sig)) {
        matchingCorrectCount++;
      }
    }

    if (isUnique && matchingCorrectCount === 1) {
      const shuffledOptions = shuffle(candidatePool).map((opt, idx) => ({
        id: `opt_${idx}`,
        letter: String.fromCharCode(65 + idx),
        matrix: opt.matrix,
        isTrueMatch: opt.isCorrect,
      }));

      const correctOption = shuffledOptions.find((o) => o.isTrueMatch);

      return {
        taskId,
        mode: SPATIAL_MODES.MENTAL_ROTATION,
        difficultyLevel: level,
        roundNumber,
        timeoutWindowMs,
        targetMatrix: rot0,
        rotationAngle: chosenRotation.angle,
        options: shuffledOptions,
        correctOptionId: correctOption.id,
        correctOptionLetter: correctOption.letter,
        instructionText: 'IDENTIFY THE MATCHING ROTATION',
        actionPrompt: 'WHICH CANDIDATE IS A VALID 2D ROTATION?',
        createdAt: Date.now(),
      };
    }
  }

  // Safe fallback
  const fallbackTarget = BASE_SHAPES_3X3[0];
  const fallbackRot = rotate90(fallbackTarget);
  const fallbackMirror = mirrorHorizontal(fallbackTarget);
  const fallbackMut = mutateShape(rotate180(fallbackTarget));

  const fallbackOptions = [
    { id: 'opt_0', letter: 'A', matrix: fallbackRot, isTrueMatch: true },
    { id: 'opt_1', letter: 'B', matrix: fallbackMirror, isTrueMatch: false },
    { id: 'opt_2', letter: 'C', matrix: fallbackMut, isTrueMatch: false },
  ];

  return {
    taskId,
    mode: SPATIAL_MODES.MENTAL_ROTATION,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    targetMatrix: fallbackTarget,
    rotationAngle: 90,
    options: fallbackOptions,
    correctOptionId: 'opt_0',
    correctOptionLetter: 'A',
    instructionText: 'IDENTIFY THE MATCHING ROTATION',
    actionPrompt: 'WHICH CANDIDATE IS A VALID 2D ROTATION?',
    createdAt: Date.now(),
  };
}

export default {
  generateMentalRotationTask,
};
