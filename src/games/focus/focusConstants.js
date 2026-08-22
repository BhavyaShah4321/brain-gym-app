/**
 * OVERLOAD - Focus Engine Constants
 * Constants, stimuli definitions, combo caps, and timing constraints for
 * Target Search and Visual Tracking training.
 */

export const FOCUS_MODES = {
  TARGET_SEARCH: 'target_search',
  VISUAL_TRACKING: 'visual_tracking',
};

export const SESSION_TYPES = {
  QUICK: 'quick',        // 10 rounds
  STANDARD: 'standard',   // 20 rounds
  ENDLESS: 'endless',    // Unlimited rounds
};

export const FOCUS_DIFFICULTY_PARAMS = {
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
  quickRounds: 10,
  standardRounds: 20,
};

// Response deadlines per difficulty level in milliseconds (for decision phase)
export const LEVEL_DEADLINES_MS = {
  1: 4000,
  2: 3600,
  3: 3200,
  4: 2800,
  5: 2500,
  6: 2200,
  7: 2000,
  8: 1800,
  9: 1600,
  10: 1400,
};

// Target Search grid dimensions per difficulty tier
export const LEVEL_GRID_CONFIG = {
  1: { count: 4, cols: 2 },   // 2x2
  2: { count: 6, cols: 3 },   // 2x3
  3: { count: 6, cols: 3 },   // 2x3
  4: { count: 9, cols: 3 },   // 3x3
  5: { count: 9, cols: 3 },   // 3x3
  6: { count: 12, cols: 3 },  // 4x3
  7: { count: 12, cols: 4 },  // 3x4
  8: { count: 16, cols: 4 },  // 4x4
  9: { count: 16, cols: 4 },  // 4x4
  10: { count: 16, cols: 4 }, // 4x4
};

// Visual Tracking configurations per difficulty tier
export const TRACKING_LEVEL_CONFIG = {
  1: { objectCount: 3, movementSteps: 2, stepDurationMs: 700, layout: 'linear' },
  2: { objectCount: 4, movementSteps: 3, stepDurationMs: 650, layout: 'grid' },
  3: { objectCount: 4, movementSteps: 4, stepDurationMs: 580, layout: 'grid' },
  4: { objectCount: 5, movementSteps: 4, stepDurationMs: 520, layout: 'grid' },
  5: { objectCount: 5, movementSteps: 5, stepDurationMs: 480, layout: 'grid' },
  6: { objectCount: 6, movementSteps: 6, stepDurationMs: 440, layout: 'grid' },
  7: { objectCount: 6, movementSteps: 7, stepDurationMs: 400, layout: 'grid' },
  8: { objectCount: 7, movementSteps: 7, stepDurationMs: 380, layout: 'grid' },
  9: { objectCount: 8, movementSteps: 8, stepDurationMs: 350, layout: 'grid' },
  10: { objectCount: 8, movementSteps: 9, stepDurationMs: 320, layout: 'grid' },
};

// High-contrast clean luxury color palette for stimuli
export const STIMULI_COLORS = [
  { name: 'Navy', hex: '#1B2A4A', border: 'rgba(27, 42, 74, 0.25)' },
  { name: 'Gold', hex: '#C5A55A', border: 'rgba(197, 165, 90, 0.35)' },
  { name: 'Sage', hex: '#6B8F71', border: 'rgba(107, 143, 113, 0.35)' },
  { name: 'Rose', hex: '#C4787A', border: 'rgba(196, 120, 122, 0.35)' },
  { name: 'Slate', hex: '#4A5B78', border: 'rgba(74, 91, 120, 0.30)' },
  { name: 'Plum', hex: '#7A5A82', border: 'rgba(122, 90, 130, 0.30)' },
];

// Distinct geometric shapes for Target Search
export const STIMULI_SHAPES = ['▲', '■', '●', '◆', '★', '⬢', '▼', '✚'];

// Combo multiplier breakpoints (max cap 1.5x)
export function getComboMultiplier(combo) {
  if (combo >= 15) return 1.5;
  if (combo >= 12) return 1.4;
  if (combo >= 9) return 1.3;
  if (combo >= 6) return 1.2;
  if (combo >= 3) return 1.1;
  return 1.0;
}

export default {
  FOCUS_MODES,
  SESSION_TYPES,
  FOCUS_DIFFICULTY_PARAMS,
  LEVEL_DEADLINES_MS,
  LEVEL_GRID_CONFIG,
  TRACKING_LEVEL_CONFIG,
  STIMULI_COLORS,
  STIMULI_SHAPES,
  getComboMultiplier,
};
