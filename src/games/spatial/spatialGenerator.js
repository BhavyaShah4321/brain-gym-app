/**
 * OVERLOAD - Spatial Task Generator Router
 * Procedural generation for Mental Rotation, Spatial Navigation, and Mirror Map.
 */

import { SPATIAL_MODES } from './spatialConstants.js';
import { generateMentalRotationTask } from './mentalRotation/mentalRotationGenerator.js';
import { generateSpatialNavigationTask } from './spatialNavigation/spatialNavigationGenerator.js';
import { generateMirrorMapTask } from './mirrorMap/mirrorMapGenerator.js';

/**
 * Generates an infinite procedural task for any Spatial Reasoning mode.
 *
 * @param {Object} params
 * @param {string} params.mode - 'mental_rotation' | 'spatial_navigation' | 'mirror_map'
 * @param {number} params.difficultyLevel - 1 to 10
 * @param {number} params.roundNumber - Current round number
 * @returns {Object} Structured task object
 */
export function generateSpatialTask({
  mode = SPATIAL_MODES.MENTAL_ROTATION,
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  switch (mode) {
    case SPATIAL_MODES.MENTAL_ROTATION:
      return generateMentalRotationTask({ difficultyLevel, roundNumber });

    case SPATIAL_MODES.SPATIAL_NAVIGATION:
      return generateSpatialNavigationTask({ difficultyLevel, roundNumber });

    case SPATIAL_MODES.MIRROR_MAP:
      return generateMirrorMapTask({ difficultyLevel, roundNumber });

    default:
      return generateMentalRotationTask({ difficultyLevel, roundNumber });
  }
}

export default {
  generateSpatialTask,
};
