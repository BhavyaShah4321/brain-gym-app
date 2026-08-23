/**
 * OVERLOAD - Mind Rush Task Generator Router
 * Procedural generation for Blast Logic, Chain Reaction, and Boss Breaker.
 */

import { MIND_RUSH_MODES } from './mindRushConstants.js';
import { generateBlastLogicTask } from './blastLogic/blastLogicGenerator.js';
import { generateChainReactionTask } from './chainReaction/chainReactionGenerator.js';
import { generateBossBreakerTask } from './bossBreaker/bossBreakerGenerator.js';

/**
 * Generates an arcade cognitive challenge for any Mind Rush mode.
 *
 * @param {Object} params
 * @param {string} params.mode - 'blast_logic' | 'chain_reaction' | 'boss_breaker'
 * @param {number} params.difficultyLevel - 1 to 10
 * @param {number} params.roundNumber - Current round number
 * @param {number} params.currentPhase - Boss phase (1 to 5) for Boss Breaker
 * @returns {Object} Structured task object
 */
export function generateMindRushTask({
  mode = MIND_RUSH_MODES.BLAST_LOGIC,
  difficultyLevel = 1,
  roundNumber = 1,
  currentPhase = 1,
} = {}) {
  switch (mode) {
    case MIND_RUSH_MODES.BLAST_LOGIC:
      return generateBlastLogicTask({ difficultyLevel, roundNumber });

    case MIND_RUSH_MODES.CHAIN_REACTION:
      return generateChainReactionTask({ difficultyLevel, roundNumber });

    case MIND_RUSH_MODES.BOSS_BREAKER:
      return generateBossBreakerTask({ difficultyLevel, roundNumber, currentPhase });

    default:
      return generateBlastLogicTask({ difficultyLevel, roundNumber });
  }
}

export default {
  generateMindRushTask,
};
