/**
 * OVERLOAD - Reaction Speed Constants
 * Constants, randomized delay profiles, timeout limits, and combo multipliers
 * for the Complete Reaction Speed faculty (3 distinct games: Target Tap, Rapid Choice, Direction Reaction).
 */

export const REACTION_MODES = {
  TARGET_TAP: 'target_tap',
  RAPID_CHOICE: 'rapid_choice',
  DIRECTION_REACTION: 'direction_reaction',
};

export const SESSION_TYPES = {
  QUICK: 'quick',        // 10 rounds
  STANDARD: 'standard',   // 20 rounds
  ENDLESS: 'endless',    // Unlimited rounds
};

export const REACTION_DIFFICULTY_PARAMS = {
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
  quickRounds: 10,
  standardRounds: 20,
};

// Variable randomized waiting delays (min/max ms) per level
export const DELAY_RANGES_MS = {
  1: [1400, 2500],
  2: [1200, 2300],
  3: [1100, 2100],
  4: [1000, 1900],
  5: [900, 1800],
  6: [800, 1600],
  7: [700, 1500],
  8: [650, 1400],
  9: [600, 1300],
  10: [500, 1200],
};

// Response timeout windows per difficulty level (ms)
export const TIMEOUT_WINDOWS_MS = {
  1: 2500,
  2: 2200,
  3: 2000,
  4: 1800,
  5: 1600,
  6: 1500,
  7: 1400,
  8: 1300,
  9: 1200,
  10: 1100,
};

// Mode metadata definitions
export const REACTION_MODE_DETAILS = {
  [REACTION_MODES.TARGET_TAP]: {
    id: REACTION_MODES.TARGET_TAP,
    name: 'Target Tap',
    metricName: 'Motor Reflex',
    description: 'Detect unpredictable visual onset and execute rapid motor tap.',
    instruction: 'WAIT FOR TARGET...',
    activeInstruction: 'TAP THE TARGET NOW!',
  },
  [REACTION_MODES.RAPID_CHOICE]: {
    id: REACTION_MODES.RAPID_CHOICE,
    name: 'Rapid Choice',
    metricName: 'Decision Speed',
    description: 'Discriminate target symbols and make instant motor decisions.',
    instruction: 'IDENTIFY TARGET SYMBOL',
    activeInstruction: 'TAP THE MATCHING TARGET!',
  },
  [REACTION_MODES.DIRECTION_REACTION]: {
    id: REACTION_MODES.DIRECTION_REACTION,
    name: 'Direction Reaction',
    metricName: 'Mapping Latency',
    description: 'Translate a visual directional cue into the correct physical response.',
    instruction: 'WAIT FOR DIRECTION...',
    activeInstruction: 'TAP MATCHING DIRECTION!',
  },
};

// Geometric stimuli shapes for Rapid Choice and Target Tap
export const REACTION_SHAPES = [
  { id: 'circle', symbol: '●', name: 'Circle' },
  { id: 'triangle', symbol: '▲', name: 'Triangle' },
  { id: 'square', symbol: '■', name: 'Square' },
  { id: 'diamond', symbol: '◆', name: 'Diamond' },
  { id: 'star', symbol: '★', name: 'Star' },
  { id: 'hexagon', symbol: '⬢', name: 'Hexagon' },
];

// Direction definitions for Direction Reaction
export const DIRECTION_DEFINITIONS = {
  UP: { id: 'up', symbol: '↑', label: 'UP', icon: 'arrow-up' },
  DOWN: { id: 'down', symbol: '↓', label: 'DOWN', icon: 'arrow-down' },
  LEFT: { id: 'left', symbol: '←', label: 'LEFT', icon: 'arrow-back' },
  RIGHT: { id: 'right', symbol: '→', label: 'RIGHT', icon: 'arrow-forward' },
};

export const DIRECTIONS_LIST = [
  DIRECTION_DEFINITIONS.UP,
  DIRECTION_DEFINITIONS.DOWN,
  DIRECTION_DEFINITIONS.LEFT,
  DIRECTION_DEFINITIONS.RIGHT,
];

// Luxury color tokens for reaction stimuli
export const REACTION_COLORS = {
  navy: { name: 'Navy', hex: '#1B2A4A' },
  sage: { name: 'Sage Green', hex: '#6B8F71' },
  gold: { name: 'Gold', hex: '#C5A55A' },
  rose: { name: 'Rose', hex: '#C4787A' },
  slate: { name: 'Slate', hex: '#4A5B78' },
  plum: { name: 'Plum', hex: '#7A5A82' },
};

// Combo multiplier calculation (1.0x to 1.5x cap)
export function getReactionComboMultiplier(combo) {
  if (combo >= 15) return 1.5;
  if (combo >= 12) return 1.4;
  if (combo >= 9) return 1.3;
  if (combo >= 6) return 1.2;
  if (combo >= 3) return 1.1;
  return 1.0;
}

export default {
  REACTION_MODES,
  SESSION_TYPES,
  REACTION_DIFFICULTY_PARAMS,
  DELAY_RANGES_MS,
  TIMEOUT_WINDOWS_MS,
  REACTION_MODE_DETAILS,
  REACTION_SHAPES,
  DIRECTION_DEFINITIONS,
  DIRECTIONS_LIST,
  REACTION_COLORS,
  getReactionComboMultiplier,
};
