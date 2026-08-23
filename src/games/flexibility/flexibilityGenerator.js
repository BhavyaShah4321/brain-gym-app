/**
 * OVERLOAD - Cognitive Flexibility Task Generator Router
 * Procedural generation for Sort Shift, Pattern Shift, and Dual Rule.
 */

import { FLEXIBILITY_MODES } from './flexibilityConstants.js';
import { generateSortShiftTask } from './sortShift/sortShiftGenerator.js';
import { generatePatternShiftTask } from './patternShift/patternShiftGenerator.js';
import { generateDualRuleTask } from './dualRule/dualRuleGenerator.js';

/**
 * Generates an infinite procedural task for any Cognitive Flexibility mode.
 *
 * @param {Object} params
 * @param {string} params.mode - 'sort_shift' | 'pattern_shift' | 'dual_rule'
 * @param {number} params.difficultyLevel - 1 to 10
 * @param {number} params.roundNumber - Current round number
 * @param {string|null} params.previousRule - Previously active rule for Sort Shift
 * @returns {Object} Structured task object
 */
export function generateFlexibilityTask({
  mode = FLEXIBILITY_MODES.SORT_SHIFT,
  difficultyLevel = 1,
  roundNumber = 1,
  previousRule = null,
} = {}) {
  switch (mode) {
    case FLEXIBILITY_MODES.SORT_SHIFT:
      return generateSortShiftTask({ difficultyLevel, roundNumber, previousRule });

    case FLEXIBILITY_MODES.PATTERN_SHIFT:
      return generatePatternShiftTask({ difficultyLevel, roundNumber });

    case FLEXIBILITY_MODES.DUAL_RULE:
      return generateDualRuleTask({ difficultyLevel, roundNumber });

    default:
      return generateSortShiftTask({ difficultyLevel, roundNumber, previousRule });
  }
}

export default {
  generateFlexibilityTask,
};
