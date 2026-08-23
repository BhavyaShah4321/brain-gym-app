/**
 * OVERLOAD - Cognitive Flexibility Constants
 * Constants, attribute tokens, timeout limits, and combo multipliers
 * for the Complete Cognitive Flexibility faculty (Sort Shift, Pattern Shift, Dual Rule).
 */

export const FLEXIBILITY_MODES = {
  SORT_SHIFT: 'sort_shift',
  PATTERN_SHIFT: 'pattern_shift',
  DUAL_RULE: 'dual_rule',
};

export const SESSION_TYPES = {
  QUICK: 'quick',        // 10 rounds
  STANDARD: 'standard',   // 20 rounds
  ENDLESS: 'endless',    // Unlimited rounds
};

export const FLEXIBILITY_DIFFICULTY_PARAMS = {
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
  quickRounds: 10,
  standardRounds: 20,
};

// Response timeout windows per difficulty level (ms)
export const TIMEOUT_WINDOWS_MS = {
  [FLEXIBILITY_MODES.SORT_SHIFT]: {
    1: 7500,
    2: 7000,
    3: 6500,
    4: 6000,
    5: 5500,
    6: 5000,
    7: 4500,
    8: 4000,
    9: 3600,
    10: 3200,
  },
  [FLEXIBILITY_MODES.PATTERN_SHIFT]: {
    1: 8500,
    2: 8000,
    3: 7500,
    4: 7000,
    5: 6500,
    6: 6000,
    7: 5400,
    8: 4800,
    9: 4200,
    10: 3600,
  },
  [FLEXIBILITY_MODES.DUAL_RULE]: {
    1: 7500,
    2: 7000,
    3: 6500,
    4: 6000,
    5: 5500,
    6: 5000,
    7: 4500,
    8: 4000,
    9: 3600,
    10: 3200,
  },
};

// Attribute tokens for classification
export const ATTRIBUTE_TOKENS = {
  colors: [
    { id: 'red', name: 'RED', hex: '#EF4444' },
    { id: 'blue', name: 'BLUE', hex: '#3B82F6' },
    { id: 'green', name: 'GREEN', hex: '#10B981' },
    { id: 'gold', name: 'GOLD', hex: '#F59E0B' },
  ],
  shapes: [
    { id: 'circle', name: 'CIRCLE', icon: 'ellipse' },
    { id: 'square', name: 'SQUARE', icon: 'square' },
    { id: 'triangle', name: 'TRIANGLE', icon: 'triangle' },
    { id: 'star', name: 'STAR', icon: 'star' },
  ],
  sizes: [
    { id: 'small', name: 'SMALL', scale: 0.65 },
    { id: 'medium', name: 'MEDIUM', scale: 1.0 },
    { id: 'large', name: 'LARGE', scale: 1.35 },
  ],
};

// Mode metadata definitions
export const FLEXIBILITY_MODE_DETAILS = {
  [FLEXIBILITY_MODES.SORT_SHIFT]: {
    id: FLEXIBILITY_MODES.SORT_SHIFT,
    name: 'Sort Shift',
    metricName: 'Switch Accuracy',
    description: 'Rapidly switch mental sets as global sorting rules transition.',
    instruction: 'CLASSIFY BY ACTIVE RULE',
    actionPrompt: 'APPLY CURRENT SORTING DIMENSION',
  },
  [FLEXIBILITY_MODES.PATTERN_SHIFT]: {
    id: FLEXIBILITY_MODES.PATTERN_SHIFT,
    name: 'Pattern Shift',
    metricName: 'Transition Detection',
    description: 'Detect mid-sequence structural rule changes and adapt predictions.',
    instruction: 'IDENTIFY SHIFTED PATTERN',
    actionPrompt: 'SELECT NEXT SYMBOL FOLLOWING NEW RULE',
  },
  [FLEXIBILITY_MODES.DUAL_RULE]: {
    id: FLEXIBILITY_MODES.DUAL_RULE,
    name: 'Dual Rule',
    metricName: 'Contextual Dispatch',
    description: 'Select and execute the correct rule branch based on contextual cues.',
    instruction: 'EVALUATE CONTEXTUAL CONDITION',
    actionPrompt: 'DISPATCH RULE BRANCH ACCORDING TO CONTEXT',
  },
};

// Combo multiplier calculation (1.0x to 1.5x cap)
export function getFlexibilityComboMultiplier(combo) {
  if (combo >= 15) return 1.5;
  if (combo >= 12) return 1.4;
  if (combo >= 9) return 1.3;
  if (combo >= 6) return 1.2;
  if (combo >= 3) return 1.1;
  return 1.0;
}

export default {
  FLEXIBILITY_MODES,
  SESSION_TYPES,
  FLEXIBILITY_DIFFICULTY_PARAMS,
  TIMEOUT_WINDOWS_MS,
  ATTRIBUTE_TOKENS,
  FLEXIBILITY_MODE_DETAILS,
  getFlexibilityComboMultiplier,
};
