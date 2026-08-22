/**
 * OVERLOAD - Reaction Task Generator Router
 * Procedural generation for Target Tap, Rapid Choice, and Direction Reaction.
 */

import { REACTION_MODES } from './reactionConstants';
import { generateTargetTapTask } from './targetTap/targetTapGenerator';
import { generateRapidChoiceTask } from './rapidChoice/rapidChoiceGenerator';
import { generateDirectionReactionTask } from './directionReaction/directionReactionGenerator';

/**
 * Generates an infinite procedural task for any Reaction mode.
 *
 * @param {Object} params
 * @param {string} params.mode - 'target_tap' | 'rapid_choice' | 'direction_reaction'
 * @param {number} params.difficultyLevel - 1 to 10
 * @param {number} params.roundNumber - Current round number
 * @returns {Object} Structured task object
 */
export function generateReactionTask({
  mode = REACTION_MODES.TARGET_TAP,
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  switch (mode) {
    case REACTION_MODES.TARGET_TAP:
      return generateTargetTapTask({ difficultyLevel, roundNumber });

    case REACTION_MODES.RAPID_CHOICE:
      return generateRapidChoiceTask({ difficultyLevel, roundNumber });

    case REACTION_MODES.DIRECTION_REACTION:
      return generateDirectionReactionTask({ difficultyLevel, roundNumber });

    default:
      return generateTargetTapTask({ difficultyLevel, roundNumber });
  }
}

export default {
  generateReactionTask,
};
