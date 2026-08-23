/**
 * OVERLOAD - Decision Making Constants
 * Constants, attribute tokens, timeout limits, and combo multipliers
 * for the Complete Decision Making faculty (Priority Sort, Best Choice, Rule Switch).
 */

export const DECISION_MODES = {
  PRIORITY_SORT: 'priority_sort',
  BEST_CHOICE: 'best_choice',
  RULE_SWITCH: 'rule_switch',
};

export const SESSION_TYPES = {
  QUICK: 'quick',        // 10 rounds
  STANDARD: 'standard',   // 20 rounds
  ENDLESS: 'endless',    // Unlimited rounds
};

export const DECISION_DIFFICULTY_PARAMS = {
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
  quickRounds: 10,
  standardRounds: 20,
};

// Response timeout windows per difficulty level (ms)
export const TIMEOUT_WINDOWS_MS = {
  [DECISION_MODES.PRIORITY_SORT]: {
    1: 8500,
    2: 8000,
    3: 7500,
    4: 7000,
    5: 6400,
    6: 5800,
    7: 5200,
    8: 4700,
    9: 4200,
    10: 3800,
  },
  [DECISION_MODES.BEST_CHOICE]: {
    1: 8000,
    2: 7500,
    3: 7000,
    4: 6400,
    5: 5800,
    6: 5200,
    7: 4700,
    8: 4300,
    9: 3900,
    10: 3500,
  },
  [DECISION_MODES.RULE_SWITCH]: {
    1: 6500,
    2: 6000,
    3: 5500,
    4: 5000,
    5: 4500,
    6: 4100,
    7: 3700,
    8: 3300,
    9: 3000,
    10: 2700,
  },
};

// Mode metadata definitions
export const DECISION_MODE_DETAILS = {
  [DECISION_MODES.PRIORITY_SORT]: {
    id: DECISION_MODES.PRIORITY_SORT,
    name: 'Priority Sort',
    metricName: 'Priority Accuracy',
    description: 'Evaluate competing priorities across urgency, impact, and deadlines.',
    instruction: 'EVALUATE COMPETING PRIORITIES',
    actionPrompt: 'WHICH TASK SHOULD YOU PRIORITIZE FIRST?',
  },
  [DECISION_MODES.BEST_CHOICE]: {
    id: DECISION_MODES.BEST_CHOICE,
    name: 'Best Choice',
    metricName: 'Constraint Optimization',
    description: 'Analyze multi-attribute options to identify the single optimal choice satisfying target constraints.',
    instruction: 'OPTIMIZE TARGET OBJECTIVE',
    actionPrompt: 'SELECT THE OPTIMAL OPTION',
  },
  [DECISION_MODES.RULE_SWITCH]: {
    id: DECISION_MODES.RULE_SWITCH,
    name: 'Rule Switch',
    metricName: 'Cognitive Flexibility',
    description: 'Adapt decision rules dynamically based on changing situational conditions.',
    instruction: 'APPLY ACTIVE CONDITIONAL RULE',
    actionPrompt: 'CHOOSE BASED ON ACTIVE RULE',
  },
};

// Colors for Rule Switch modifiers
export const RULE_MODIFIER_COLORS = {
  navy: { id: 'navy', name: 'Navy', hex: '#1B2A4A', ruleDesc: 'LARGEST NUMBER' },
  gold: { id: 'gold', name: 'Gold', hex: '#C5A55A', ruleDesc: 'SMALLEST NUMBER' },
  sage: { id: 'sage', name: 'Sage Green', hex: '#6B8F71', ruleDesc: 'CLOSEST TO 50' },
  rose: { id: 'rose', name: 'Rose', hex: '#C4787A', ruleDesc: 'EVEN NUMBER' },
};

// Combo multiplier calculation (1.0x to 1.5x cap)
export function getDecisionComboMultiplier(combo) {
  if (combo >= 15) return 1.5;
  if (combo >= 12) return 1.4;
  if (combo >= 9) return 1.3;
  if (combo >= 6) return 1.2;
  if (combo >= 3) return 1.1;
  return 1.0;
}

export default {
  DECISION_MODES,
  SESSION_TYPES,
  DECISION_DIFFICULTY_PARAMS,
  TIMEOUT_WINDOWS_MS,
  DECISION_MODE_DETAILS,
  RULE_MODIFIER_COLORS,
  getDecisionComboMultiplier,
};
