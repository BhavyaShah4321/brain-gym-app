/**
 * OVERLOAD - Rapid Choice Task Generator
 * Generates visual discrimination challenges with randomized target positioning and distractor counts.
 */

import {
  REACTION_MODES,
  DELAY_RANGES_MS,
  TIMEOUT_WINDOWS_MS,
  REACTION_SHAPES,
  REACTION_COLORS,
} from '../reactionConstants.js';

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

function getRandomDelay(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

export function generateRapidChoiceTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const delayRange = DELAY_RANGES_MS[level] || [1000, 2000];
  const stimulusDelayMs = getRandomDelay(delayRange[0] * 0.5, delayRange[1] * 0.7);
  const timeoutWindowMs = TIMEOUT_WINDOWS_MS[level] || 2000;
  const taskId = `rapid_choice_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Choice counts: 2 choices (level 1-2), 4 choices (level 3-6), 6 choices (level 7-10)
  const choiceCount = level <= 2 ? 2 : level <= 6 ? 4 : 6;
  const gridCols = choiceCount === 2 ? 2 : choiceCount === 4 ? 2 : 3;

  const targetShape = pickRandom(REACTION_SHAPES);
  const otherShapes = REACTION_SHAPES.filter((s) => s.id !== targetShape.id);
  const targetColor = pickRandom(Object.values(REACTION_COLORS));

  const targetIndex = Math.floor(Math.random() * choiceCount);
  const choices = [];

  for (let i = 0; i < choiceCount; i++) {
    if (i === targetIndex) {
      choices.push({
        id: `choice_${i}_target`,
        shape: targetShape.symbol,
        shapeName: targetShape.name,
        color: targetColor.hex,
        colorName: targetColor.name,
        isTarget: true,
      });
    } else {
      const distractorShape = pickRandom(otherShapes);
      const color = pickRandom(Object.values(REACTION_COLORS));
      choices.push({
        id: `choice_${i}_distractor`,
        shape: distractorShape.symbol,
        shapeName: distractorShape.name,
        color: color.hex,
        colorName: color.name,
        isTarget: false,
      });
    }
  }

  return {
    taskId,
    mode: REACTION_MODES.RAPID_CHOICE,
    difficultyLevel: level,
    roundNumber,
    stimulusDelayMs,
    timeoutWindowMs,
    targetShape: targetShape.name,
    targetSymbol: targetShape.symbol,
    correctAnswer: targetIndex,
    choices,
    choiceCount,
    gridCols,
    instructionText: `TARGET: ${targetShape.name.toUpperCase()} (${targetShape.symbol})`,
    instructionActive: `TAP ${targetShape.symbol} IMMEDIATELY!`,
    createdAt: Date.now(),
  };
}

export default {
  generateRapidChoiceTask,
};
