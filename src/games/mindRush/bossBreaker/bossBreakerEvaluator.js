/**
 * OVERLOAD - Boss Breaker Evaluator
 * Evaluates strike precision, shield fracture, and damage calculations.
 */

import { MIND_RUSH_MODES, COMBAT_PARAMS } from '../mindRushConstants.js';

export function evaluateBossBreakerResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 8000;
  const currentPhase = task?.currentPhase || 1;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: MIND_RUSH_MODES.BOSS_BREAKER,
      difficultyLevel: level,
      currentPhase,
      isCorrect: false,
      isTimedOut: true,
      damageDealt: 0,
      damageTaken: COMBAT_PARAMS.PLAYER_DAMAGE_TAKEN,
      energyGained: 0,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'BOSS COUNTER-ATTACK! 💥',
      evaluatedAt: Date.now(),
    };
  }

  const isCorrect = userChoiceId === task?.correctOptionId;

  return {
    taskId: task?.taskId,
    mode: MIND_RUSH_MODES.BOSS_BREAKER,
    difficultyLevel: level,
    currentPhase,
    isCorrect,
    isTimedOut: false,
    damageDealt: isCorrect ? COMBAT_PARAMS.DAMAGE_PER_HIT : 0,
    damageTaken: isCorrect ? 0 : COMBAT_PARAMS.PLAYER_DAMAGE_TAKEN,
    energyGained: isCorrect ? COMBAT_PARAMS.ENERGY_PER_HIT : 0,
    chosenOptionId: userChoiceId,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect
      ? `SHIELD FRACTURED! -100 HP 💥`
      : 'ATTACK BLOCKED · RETALIATION! ⚡',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateBossBreakerResponse,
};
