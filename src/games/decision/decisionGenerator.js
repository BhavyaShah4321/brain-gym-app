/**
 * OVERLOAD - Decision Task Generator Router
 * Procedural generation for Priority Sort, Best Choice, and Rule Switch.
 */

import { DECISION_MODES } from './decisionConstants.js';
import { generatePrioritySortTask } from './prioritySort/prioritySortGenerator.js';
import { generateBestChoiceTask } from './bestChoice/bestChoiceGenerator.js';
import { generateRuleSwitchTask } from './ruleSwitch/ruleSwitchGenerator.js';

/**
 * Generates an infinite procedural task for any Decision Making mode.
 *
 * @param {Object} params
 * @param {string} params.mode - 'priority_sort' | 'best_choice' | 'rule_switch'
 * @param {number} params.difficultyLevel - 1 to 10
 * @param {number} params.roundNumber - Current round number
 * @returns {Object} Structured task object
 */
export function generateDecisionTask({
  mode = DECISION_MODES.PRIORITY_SORT,
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  switch (mode) {
    case DECISION_MODES.PRIORITY_SORT:
      return generatePrioritySortTask({ difficultyLevel, roundNumber });

    case DECISION_MODES.BEST_CHOICE:
      return generateBestChoiceTask({ difficultyLevel, roundNumber });

    case DECISION_MODES.RULE_SWITCH:
      return generateRuleSwitchTask({ difficultyLevel, roundNumber });

    default:
      return generatePrioritySortTask({ difficultyLevel, roundNumber });
  }
}

export default {
  generateDecisionTask,
};
