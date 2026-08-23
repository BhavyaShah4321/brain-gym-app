/**
 * OVERLOAD - Logic Task Generator Router
 * Procedural generation for Deduction Grid, Sequence Logic, and Constraint Solver.
 */

import { LOGIC_MODES } from './logicConstants.js';
import { generateDeductionGridTask } from './deductionGrid/deductionGridGenerator.js';
import { generateSequenceLogicTask } from './sequenceLogic/sequenceLogicGenerator.js';
import { generateConstraintSolverTask } from './constraintSolver/constraintSolverGenerator.js';

/**
 * Generates an infinite procedural task for any Logic & Reasoning mode.
 *
 * @param {Object} params
 * @param {string} params.mode - 'deduction_grid' | 'sequence_logic' | 'constraint_solver'
 * @param {number} params.difficultyLevel - 1 to 10
 * @param {number} params.roundNumber - Current round number
 * @returns {Object} Structured task object
 */
export function generateLogicTask({
  mode = LOGIC_MODES.DEDUCTION_GRID,
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  switch (mode) {
    case LOGIC_MODES.DEDUCTION_GRID:
      return generateDeductionGridTask({ difficultyLevel, roundNumber });

    case LOGIC_MODES.SEQUENCE_LOGIC:
      return generateSequenceLogicTask({ difficultyLevel, roundNumber });

    case LOGIC_MODES.CONSTRAINT_SOLVER:
      return generateConstraintSolverTask({ difficultyLevel, roundNumber });

    default:
      return generateDeductionGridTask({ difficultyLevel, roundNumber });
  }
}

export default {
  generateLogicTask,
};
