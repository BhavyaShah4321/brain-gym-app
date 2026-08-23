/**
 * OVERLOAD - Chain Reaction Difficulty Manager
 */

export function calculateNextChainDifficulty({
  currentLevel = 1,
  recentEvaluations = [],
  consecutiveCorrect = 0,
  consecutiveErrors = 0,
} = {}) {
  const minLevel = 1;
  const maxLevel = 10;

  if (consecutiveErrors >= 2 && currentLevel > minLevel) {
    return { nextLevel: currentLevel - 1, reason: 'consecutive_errors' };
  }

  if (consecutiveCorrect >= 4 && currentLevel < maxLevel) {
    return { nextLevel: currentLevel + 1, reason: 'sequential_streak' };
  }

  if (recentEvaluations.length >= 5) {
    const window = recentEvaluations.slice(-5);
    const accuracy = (window.filter((e) => e.isCorrect).length / window.length) * 100;
    if (accuracy >= 80 && currentLevel < maxLevel) {
      return { nextLevel: currentLevel + 1, reason: 'mastery' };
    }
    if (accuracy < 60 && currentLevel > minLevel) {
      return { nextLevel: currentLevel - 1, reason: 'decay' };
    }
  }

  return { nextLevel: currentLevel, reason: 'maintained' };
}

export default {
  calculateNextChainDifficulty,
};
