/**
 * OVERLOAD - Processing Speed Constants
 * Constants, stimuli definitions, timeout limits, and combo multipliers
 * for the Complete Processing Speed faculty (3 distinct games).
 */

export const PROCESSING_MODES = {
  SYMBOL_MATCH: 'symbol_match',
  NUMBER_SCAN: 'number_scan',
  PATTERN_COMPLETE: 'pattern_complete',
};

export const SESSION_TYPES = {
  QUICK: 'quick',        // 10 rounds
  STANDARD: 'standard',   // 20 rounds
  ENDLESS: 'endless',    // Unlimited rounds
};

export const PROCESSING_DIFFICULTY_PARAMS = {
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
  quickRounds: 10,
  standardRounds: 20,
};

// Response timeout windows per difficulty level (ms)
export const TIMEOUT_WINDOWS_MS = {
  [PROCESSING_MODES.SYMBOL_MATCH]: {
    1: 5000,
    2: 4600,
    3: 4200,
    4: 3800,
    5: 3500,
    6: 3200,
    7: 2900,
    8: 2600,
    9: 2400,
    10: 2200,
  },
  [PROCESSING_MODES.NUMBER_SCAN]: {
    1: 5500,
    2: 5000,
    3: 4500,
    4: 4100,
    5: 3800,
    6: 3500,
    7: 3200,
    8: 2900,
    9: 2700,
    10: 2500,
  },
  [PROCESSING_MODES.PATTERN_COMPLETE]: {
    1: 6000,
    2: 5500,
    3: 5000,
    4: 4500,
    5: 4100,
    6: 3800,
    7: 3500,
    8: 3200,
    9: 3000,
    10: 2800,
  },
};

// Mode metadata definitions
export const PROCESSING_MODE_DETAILS = {
  [PROCESSING_MODES.SYMBOL_MATCH]: {
    id: PROCESSING_MODES.SYMBOL_MATCH,
    name: 'Symbol Match',
    metricName: 'Comparison Speed',
    description: 'Compare two information sets and determine if they are identical or different.',
    instruction: 'COMPARE THE TWO SETS',
    actionPrompt: 'MATCH OR DIFFERENT?',
  },
  [PROCESSING_MODES.NUMBER_SCAN]: {
    id: PROCESSING_MODES.NUMBER_SCAN,
    name: 'Number Scan',
    metricName: 'Visual Search Rate',
    description: 'Rapid visual search to detect and identify target numbers in a grid.',
    instruction: 'FIND THE TARGET NUMBER',
    actionPrompt: 'TAP ALL TARGET CELLS',
  },
  [PROCESSING_MODES.PATTERN_COMPLETE]: {
    id: PROCESSING_MODES.PATTERN_COMPLETE,
    name: 'Pattern Complete',
    metricName: 'Pattern Processing',
    description: 'Process visual sequence rules and identify the missing terminal element.',
    instruction: 'IDENTIFY SEQUENCE RULE',
    actionPrompt: 'SELECT MISSING ELEMENT (?)',
  },
};

// Geometric stimuli shapes for Symbol Match & Pattern Complete
export const PROCESSING_SHAPES = [
  { id: 'circle', symbol: '●', name: 'Circle' },
  { id: 'triangle', symbol: '▲', name: 'Triangle' },
  { id: 'square', symbol: '■', name: 'Square' },
  { id: 'diamond', symbol: '◆', name: 'Diamond' },
  { id: 'star', symbol: '★', name: 'Star' },
  { id: 'hexagon', symbol: '⬢', name: 'Hexagon' },
  { id: 'cross', symbol: '✚', name: 'Cross' },
  { id: 'inverted_triangle', symbol: '▼', name: 'Inverted Triangle' },
  { id: 'sparkle', symbol: '✦', name: 'Sparkle' },
  { id: 'pentagon', symbol: '⬟', name: 'Pentagon' },
];

// Luxury color tokens
export const PROCESSING_COLORS = [
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Gold', hex: '#C5A55A' },
  { name: 'Sage', hex: '#6B8F71' },
  { name: 'Rose', hex: '#C4787A' },
  { name: 'Slate', hex: '#4A5B78' },
  { name: 'Plum', hex: '#7A5A82' },
];

// Combo multiplier calculation (1.0x to 1.5x cap)
export function getProcessingComboMultiplier(combo) {
  if (combo >= 15) return 1.5;
  if (combo >= 12) return 1.4;
  if (combo >= 9) return 1.3;
  if (combo >= 6) return 1.2;
  if (combo >= 3) return 1.1;
  return 1.0;
}

export default {
  PROCESSING_MODES,
  SESSION_TYPES,
  PROCESSING_DIFFICULTY_PARAMS,
  TIMEOUT_WINDOWS_MS,
  PROCESSING_MODE_DETAILS,
  PROCESSING_SHAPES,
  PROCESSING_COLORS,
  getProcessingComboMultiplier,
};
