/**
 * OVERLOAD - Logic & Reasoning Constants
 * Constants, timeout limits, combo multipliers, and mode details
 * for the Complete Logic & Reasoning faculty (Deduction Grid, Sequence Logic, Constraint Solver).
 */

export const LOGIC_MODES = {
  DEDUCTION_GRID: 'deduction_grid',
  SEQUENCE_LOGIC: 'sequence_logic',
  CONSTRAINT_SOLVER: 'constraint_solver',
};

export const SESSION_TYPES = {
  QUICK: 'quick',        // 10 rounds
  STANDARD: 'standard',   // 20 rounds
  ENDLESS: 'endless',    // Unlimited rounds
};

export const LOGIC_DIFFICULTY_PARAMS = {
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
  quickRounds: 10,
  standardRounds: 20,
};

// Response timeout windows per difficulty level (ms)
export const TIMEOUT_WINDOWS_MS = {
  [LOGIC_MODES.DEDUCTION_GRID]: {
    1: 18000,
    2: 17000,
    3: 16000,
    4: 15000,
    5: 14000,
    6: 13000,
    7: 12000,
    8: 11000,
    9: 10000,
    10: 9000,
  },
  [LOGIC_MODES.SEQUENCE_LOGIC]: {
    1: 13000,
    2: 12000,
    3: 11000,
    4: 10000,
    5: 9000,
    6: 8000,
    7: 7200,
    8: 6400,
    9: 5600,
    10: 4800,
  },
  [LOGIC_MODES.CONSTRAINT_SOLVER]: {
    1: 15000,
    2: 14000,
    3: 13000,
    4: 12000,
    5: 11000,
    6: 10000,
    7: 9000,
    8: 8000,
    9: 7000,
    10: 6000,
  },
};

// Mode metadata definitions
export const LOGIC_MODE_DETAILS = {
  [LOGIC_MODES.DEDUCTION_GRID]: {
    id: LOGIC_MODES.DEDUCTION_GRID,
    name: 'Deduction Grid',
    metricName: 'Deduction Accuracy',
    description: 'Analyze clues and deduce unique entity relationships.',
    instruction: 'DEDUCE FROM CLUES',
    actionPrompt: 'SELECT THE LOGICALLY PROVEN MATCH',
  },
  [LOGIC_MODES.SEQUENCE_LOGIC]: {
    id: LOGIC_MODES.SEQUENCE_LOGIC,
    name: 'Sequence Logic',
    metricName: 'Rule Induction',
    description: 'Discover transformation rules across mathematical and symbolic sequences.',
    instruction: 'IDENTIFY TRANSFORMATION RULE',
    actionPrompt: 'SELECT THE NUMBER THAT COMPLETES THE RULE',
  },
  [LOGIC_MODES.CONSTRAINT_SOLVER]: {
    id: LOGIC_MODES.CONSTRAINT_SOLVER,
    name: 'Constraint Solver',
    metricName: 'Constraint Precision',
    description: 'Find the only option satisfying multiple interacting conditions.',
    instruction: 'SATISFY ALL CONSTRAINTS',
    actionPrompt: 'SELECT THE ONLY OPTION SATISFYING ALL RULES',
  },
};

// Combo multiplier calculation (1.0x to 1.5x cap)
export function getLogicComboMultiplier(combo) {
  if (combo >= 15) return 1.5;
  if (combo >= 12) return 1.4;
  if (combo >= 9) return 1.3;
  if (combo >= 6) return 1.2;
  if (combo >= 3) return 1.1;
  return 1.0;
}

export default {
  LOGIC_MODES,
  SESSION_TYPES,
  LOGIC_DIFFICULTY_PARAMS,
  TIMEOUT_WINDOWS_MS,
  LOGIC_MODE_DETAILS,
  getLogicComboMultiplier,
};
