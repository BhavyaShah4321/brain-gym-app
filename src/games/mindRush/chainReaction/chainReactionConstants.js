/**
 * OVERLOAD - Chain Reaction Constants
 * Rule types, node color tokens, difficulty tiers, and scoring parameters.
 */

export const CHAIN_RULE_TYPES = {
  TARGET_PATH: 'TARGET_PATH',
  CHAIN_LENGTH: 'CHAIN_LENGTH',
  AVOID_NODE: 'AVOID_NODE',
  ORDERED_TARGETS: 'ORDERED_TARGETS',
  MAXIMUM_CHAIN: 'MAXIMUM_CHAIN',
};

export const NODE_COLORS = [
  { id: 'blue', name: 'BLUE', hex: '#3B82F6', text: '#1D4ED8' },
  { id: 'gold', name: 'GOLD', hex: '#F59E0B', text: '#B45309' },
  { id: 'cyan', name: 'CYAN', hex: '#06B6D4', text: '#0E7490' },
  { id: 'violet', name: 'VIOLET', hex: '#8B5CF6', text: '#6D28D9' },
  { id: 'emerald', name: 'EMERALD', hex: '#10B981', text: '#047857' },
  { id: 'rose', name: 'ROSE', hex: '#EF4444', text: '#B91C1C' },
];

export const CHAIN_DIFFICULTY_TIERS = {
  EASY: { minLevel: 1, maxLevel: 3, nodeCount: 5, maxBranches: 1 },
  MEDIUM: { minLevel: 4, maxLevel: 6, nodeCount: 7, maxBranches: 2 },
  HARD: { minLevel: 7, maxLevel: 8, nodeCount: 9, maxBranches: 3 },
  ADVANCED: { minLevel: 9, maxLevel: 10, nodeCount: 12, maxBranches: 4 },
};

export default {
  CHAIN_RULE_TYPES,
  NODE_COLORS,
  CHAIN_DIFFICULTY_TIERS,
};
