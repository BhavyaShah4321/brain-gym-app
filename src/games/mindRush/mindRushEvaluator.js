/**
 * OVERLOAD - Mind Rush Response Evaluator Router
 * Pure evaluation function delegating to mode evaluators and applying scoring formulas.
 */

import { MIND_RUSH_MODES } from './mindRushConstants.js';
import { evaluateBlastLogicResponse } from './blastLogic/blastLogicEvaluator.js';
import { evaluateChainReactionResponse } from './chainReaction/chainReactionEvaluator.js';
import { evaluateBossBreakerResponse } from './bossBreaker/bossBreakerEvaluator.js';
import { calculateMindRushScore } from './mindRushScoring.js';

/**
 * Evaluates a response across Blast Logic, Chain Reaction, or Boss Breaker.
 *
 * @param {Object} params
 * @param {Object} params.task - The active task object
 * @param {string} params.userResponse - Selected target ID / node ID / option ID
 * @param {number} params.responseTimeMs - Milliseconds elapsed
 * @param {boolean} params.isTimedOut - True if timeout expired
 * @param {number} params.currentCombo - Consecutive hits
 * @returns {Object} Structured evaluation result with score and combat telemetry
 */
export function evaluateMindRushResponse({
  task,
  userResponse = null,
  responseTimeMs = 0,
  isTimedOut = false,
  currentCombo = 0,
}) {
  if (!task) {
    throw new Error('Task object is required for Mind Rush evaluation.');
  }

  const mode = task.mode || MIND_RUSH_MODES.BLAST_LOGIC;
  const timeoutWindowMs = task.timeoutWindowMs || 8000;
  const difficultyLevel = task.difficultyLevel || 1;

  let rawEvaluation = null;

  switch (mode) {
    case MIND_RUSH_MODES.BLAST_LOGIC:
      rawEvaluation = evaluateBlastLogicResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case MIND_RUSH_MODES.CHAIN_REACTION:
      rawEvaluation = evaluateChainReactionResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    case MIND_RUSH_MODES.BOSS_BREAKER:
      rawEvaluation = evaluateBossBreakerResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;

    default:
      rawEvaluation = evaluateBlastLogicResponse({
        task,
        userChoiceId: userResponse,
        responseTimeMs,
        isTimedOut,
      });
      break;
  }

  const isCorrect = Boolean(rawEvaluation.isCorrect);
  const nextCombo = isCorrect ? currentCombo + 1 : 0;

  const scoreResult = calculateMindRushScore({
    evaluation: rawEvaluation,
    timeoutWindowMs,
    difficultyLevel,
    currentCombo: isCorrect ? nextCombo : currentCombo,
  });

  return {
    ...rawEvaluation,
    pointsAwarded: scoreResult.pointsAwarded,
    penaltyPoints: scoreResult.penaltyPoints,
    combo: nextCombo,
    comboMultiplier: scoreResult.comboMultiplier,
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateMindRushResponse,
};
