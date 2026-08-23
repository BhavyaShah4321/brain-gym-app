/**
 * OVERLOAD - Processing Task Generator Router
 * Procedural generation for Symbol Match, Number Scan, and Pattern Complete.
 */

import { PROCESSING_MODES } from './processingConstants.js';
import { generateSymbolMatchTask } from './symbolMatch/symbolMatchGenerator.js';
import { generateNumberScanTask } from './numberScan/numberScanGenerator.js';
import { generatePatternCompleteTask } from './patternComplete/patternCompleteGenerator.js';

/**
 * Generates an infinite procedural task for any Processing Speed mode.
 *
 * @param {Object} params
 * @param {string} params.mode - 'symbol_match' | 'number_scan' | 'pattern_complete'
 * @param {number} params.difficultyLevel - 1 to 10
 * @param {number} params.roundNumber - Current round number
 * @returns {Object} Structured task object
 */
export function generateProcessingTask({
  mode = PROCESSING_MODES.SYMBOL_MATCH,
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  switch (mode) {
    case PROCESSING_MODES.SYMBOL_MATCH:
      return generateSymbolMatchTask({ difficultyLevel, roundNumber });

    case PROCESSING_MODES.NUMBER_SCAN:
      return generateNumberScanTask({ difficultyLevel, roundNumber });

    case PROCESSING_MODES.PATTERN_COMPLETE:
      return generatePatternCompleteTask({ difficultyLevel, roundNumber });

    default:
      return generateSymbolMatchTask({ difficultyLevel, roundNumber });
  }
}

export default {
  generateProcessingTask,
};
