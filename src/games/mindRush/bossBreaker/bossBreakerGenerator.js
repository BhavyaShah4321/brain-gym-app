/**
 * OVERLOAD - Boss Breaker Task Generator
 * Procedural generation of multi-phase cybernetic boss shield challenges.
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

export function generateBossBreakerTask({
  difficultyLevel = 1,
  roundNumber = 1,
  currentPhase = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[MIND_RUSH_MODES.BOSS_BREAKER]?.[level] || 8000;
  const taskId = `boss_p${currentPhase}_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Boss shield challenge archetype depending on phase
  let promptText = '';
  let options = [];
  let correctOptionId = '';

  if (currentPhase === 1) {
    // Parity / Comparison Strike
    const divisor = pickRandom([3, 4, 5]);
    promptText = `BREAK SHIELD: SELECT MULTIPLE OF ${divisor}`;
    const correctVal = divisor * Math.floor(3 + Math.random() * 8);
    const distractors = [correctVal + 1, correctVal + 2, correctVal - 1];

    options = [
      { id: 'opt_c', label: `${correctVal}`, isCorrect: true },
      ...distractors.map((d, i) => ({ id: `opt_d_${i}`, label: `${d}`, isCorrect: false })),
    ];
  } else if (currentPhase === 2) {
    // Sequence Strike
    const start = Math.floor(2 + Math.random() * 5);
    const mult = 2;
    const seq = [start, start * mult, start * mult * mult];
    const nextVal = start * mult * mult * mult;
    promptText = `SHIELD LOCK: ${seq.join(' → ')} → ?`;

    options = [
      { id: 'opt_c', label: `${nextVal}`, isCorrect: true },
      { id: 'opt_d1', label: `${nextVal + 2}`, isCorrect: false },
      { id: 'opt_d2', label: `${nextVal - 4}`, isCorrect: false },
      { id: 'opt_d3', label: `${nextVal + 6}`, isCorrect: false },
    ];
  } else if (currentPhase === 3) {
    // Symbol Odd-one-out
    promptText = 'ENERGY VULNERABILITY: SELECT THE ODD SYMBOL';
    options = [
      { id: 'opt_c', label: 'STAR', icon: 'star', isCorrect: true },
      { id: 'opt_d1', label: 'SQUARE', icon: 'square', isCorrect: false },
      { id: 'opt_d2', label: 'SQUARE', icon: 'square', isCorrect: false },
      { id: 'opt_d3', label: 'SQUARE', icon: 'square', isCorrect: false },
    ];
  } else if (currentPhase === 4) {
    // Multi-Constraint Strike
    promptText = 'CORE SHIELD: GREATER THAN 30 AND DIVISIBLE BY 7';
    options = [
      { id: 'opt_c', label: '35', isCorrect: true },
      { id: 'opt_d1', label: '28', isCorrect: false }, // <= 30
      { id: 'opt_d2', label: '36', isCorrect: false }, // not div 7
      { id: 'opt_d3', label: '45', isCorrect: false }, // not div 7
    ];
  } else {
    // Phase 5: Final Core Overload Strike
    promptText = 'CORE OVERLOAD: SELECT EVEN NUMBER DIVISIBLE BY 6';
    options = [
      { id: 'opt_c', label: '48', isCorrect: true },
      { id: 'opt_d1', label: '33', isCorrect: false },
      { id: 'opt_d2', label: '40', isCorrect: false },
      { id: 'opt_d3', label: '50', isCorrect: false },
    ];
  }

  const shuffledOptions = shuffle(options).map((opt, idx) => ({
    id: opt.id,
    letter: String.fromCharCode(65 + idx),
    label: opt.label,
    icon: opt.icon,
    isCorrect: opt.isCorrect,
  }));

  const correctOption = shuffledOptions.find((o) => o.isCorrect) || shuffledOptions[0];

  return {
    taskId,
    mode: MIND_RUSH_MODES.BOSS_BREAKER,
    difficultyLevel: level,
    roundNumber,
    currentPhase,
    timeoutWindowMs,
    promptText,
    options: shuffledOptions,
    correctOptionId: correctOption.id,
    instructionText: `BOSS PHASE ${currentPhase} / 5`,
    actionPrompt: promptText,
    createdAt: Date.now(),
  };
}

export default {
  generateBossBreakerTask,
};
