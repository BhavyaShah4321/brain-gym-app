/**
 * OVERLOAD - Spatial Reasoning Constants
 * Constants, attribute tokens, timeout limits, and combo multipliers
 * for the Complete Spatial Reasoning faculty (Mental Rotation, Spatial Navigation, Mirror Map).
 */

export const SPATIAL_MODES = {
  MENTAL_ROTATION: 'mental_rotation',
  SPATIAL_NAVIGATION: 'spatial_navigation',
  MIRROR_MAP: 'mirror_map',
};

export const SESSION_TYPES = {
  QUICK: 'quick',        // 10 rounds
  STANDARD: 'standard',   // 20 rounds
  ENDLESS: 'endless',    // Unlimited rounds
};

export const SPATIAL_DIFFICULTY_PARAMS = {
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
  quickRounds: 10,
  standardRounds: 20,
};

// Response timeout windows per difficulty level (ms)
export const TIMEOUT_WINDOWS_MS = {
  [SPATIAL_MODES.MENTAL_ROTATION]: {
    1: 9000,
    2: 8500,
    3: 8000,
    4: 7500,
    5: 7000,
    6: 6400,
    7: 5800,
    8: 5200,
    9: 4600,
    10: 4000,
  },
  [SPATIAL_MODES.SPATIAL_NAVIGATION]: {
    1: 16000,
    2: 15000,
    3: 14000,
    4: 13000,
    5: 12000,
    6: 11000,
    7: 10000,
    8: 9000,
    9: 8000,
    10: 7000,
  },
  [SPATIAL_MODES.MIRROR_MAP]: {
    1: 8500,
    2: 8000,
    3: 7500,
    4: 7000,
    5: 6400,
    6: 5800,
    7: 5200,
    8: 4600,
    9: 4200,
    10: 3800,
  },
};

// Mode metadata definitions
export const SPATIAL_MODE_DETAILS = {
  [SPATIAL_MODES.MENTAL_ROTATION]: {
    id: SPATIAL_MODES.MENTAL_ROTATION,
    name: 'Mental Rotation',
    metricName: 'Rotation Accuracy',
    description: 'Rotate and compare objects mentally.',
    instruction: 'IDENTIFY THE MATCHING ROTATION',
    actionPrompt: 'WHICH CANDIDATE IS A VALID 2D ROTATION?',
  },
  [SPATIAL_MODES.SPATIAL_NAVIGATION]: {
    id: SPATIAL_MODES.SPATIAL_NAVIGATION,
    name: 'Spatial Navigation',
    metricName: 'Route Efficiency',
    description: 'Plan and navigate through complex environments.',
    instruction: 'PLAN ROUTE TO TARGET',
    actionPrompt: 'NAVIGATE FROM START TO TARGET',
  },
  [SPATIAL_MODES.MIRROR_MAP]: {
    id: SPATIAL_MODES.MIRROR_MAP,
    name: 'Mirror Map',
    metricName: 'Transformation Index',
    description: 'Transform spatial positions and orientations.',
    instruction: 'APPLY REFLECTION TRANSFORMATION',
    actionPrompt: 'SELECT THE TRANSFORMED TARGET CELL',
  },
};

// Combo multiplier calculation (1.0x to 1.5x cap)
export function getSpatialComboMultiplier(combo) {
  if (combo >= 15) return 1.5;
  if (combo >= 12) return 1.4;
  if (combo >= 9) return 1.3;
  if (combo >= 6) return 1.2;
  if (combo >= 3) return 1.1;
  return 1.0;
}

export default {
  SPATIAL_MODES,
  SESSION_TYPES,
  SPATIAL_DIFFICULTY_PARAMS,
  TIMEOUT_WINDOWS_MS,
  SPATIAL_MODE_DETAILS,
  getSpatialComboMultiplier,
};
