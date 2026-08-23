/**
 * OVERLOAD - Mind Rush Arcade Constants
 * Constants, combat attributes, timeout limits, and combo multipliers
 * for the Mind Rush Cognitive Arcade (Blast Logic, Chain Reaction, Boss Breaker).
 */

export const MIND_RUSH_MODES = {
  BLAST_LOGIC: 'blast_logic',
  CHAIN_REACTION: 'chain_reaction',
  BOSS_BREAKER: 'boss_breaker',
};

export const SESSION_TYPES = {
  QUICK: 'quick',        // 10 rounds
  STANDARD: 'standard',   // 20 rounds
  ENDLESS: 'endless',    // Unlimited / Full Boss Battle
};

export const MIND_RUSH_DIFFICULTY_PARAMS = {
  minLevel: 1,
  maxLevel: 10,
  initialLevel: 1,
  quickRounds: 10,
  standardRounds: 20,
};

// Response timeout windows per difficulty level (ms)
export const TIMEOUT_WINDOWS_MS = {
  [MIND_RUSH_MODES.BLAST_LOGIC]: {
    1: 10000,
    2: 9000,
    3: 8200,
    4: 7500,
    5: 6800,
    6: 6000,
    7: 5400,
    8: 4800,
    9: 4200,
    10: 3600,
  },
  [MIND_RUSH_MODES.CHAIN_REACTION]: {
    1: 12000,
    2: 11000,
    3: 10000,
    4: 9000,
    5: 8200,
    6: 7400,
    7: 6600,
    8: 5800,
    9: 5000,
    10: 4200,
  },
  [MIND_RUSH_MODES.BOSS_BREAKER]: {
    1: 12000,
    2: 11000,
    3: 10000,
    4: 9200,
    5: 8400,
    6: 7600,
    7: 6800,
    8: 6000,
    9: 5200,
    10: 4400,
  },
};

// Combat parameters
export const COMBAT_PARAMS = {
  PLAYER_MAX_HEALTH: 100,
  BOSS_MAX_HEALTH: 500,
  DAMAGE_PER_HIT: 100, // 1 shield break = 100 dmg
  SPECIAL_ATTACK_DAMAGE: 200,
  PLAYER_DAMAGE_TAKEN: 20,
  ENERGY_PER_HIT: 25,
  ENERGY_MAX: 100,
};

// Mode metadata definitions
export const MIND_RUSH_MODE_DETAILS = {
  [MIND_RUSH_MODES.BLAST_LOGIC]: {
    id: MIND_RUSH_MODES.BLAST_LOGIC,
    name: 'Blast Logic',
    metricName: 'Blast Accuracy',
    description: 'Target and blast floating targets matching active cognitive criteria.',
    instruction: 'BLAST MATCHING TARGETS',
    actionPrompt: 'ELIMINATE ONLY VALID TARGETS',
  },
  [MIND_RUSH_MODES.CHAIN_REACTION]: {
    id: MIND_RUSH_MODES.CHAIN_REACTION,
    name: 'Chain Reaction',
    metricName: 'Chain Multiplier',
    description: 'Identify the optimal node to trigger cascading explosive chains.',
    instruction: 'START CHAIN DETONATION',
    actionPrompt: 'SELECT THE ROOT TARGET FOR MAX CHAIN',
  },
  [MIND_RUSH_MODES.BOSS_BREAKER]: {
    id: MIND_RUSH_MODES.BOSS_BREAKER,
    name: 'Boss Breaker',
    metricName: 'Boss Damage',
    description: 'Dismantle cybernetic boss shields through multi-faculty cognitive strikes.',
    instruction: 'BREAK SHIELD COGNITIVE LOCK',
    actionPrompt: 'SOLVE CHALLENGE TO LAUNCH ATTACK',
  },
};

// High-octane combo multipliers (1.0x to 2.0x)
export function getMindRushComboMultiplier(combo) {
  if (combo >= 20) return 2.0;
  if (combo >= 15) return 1.8;
  if (combo >= 10) return 1.5;
  if (combo >= 6) return 1.3;
  if (combo >= 3) return 1.15;
  return 1.0;
}

export default {
  MIND_RUSH_MODES,
  SESSION_TYPES,
  MIND_RUSH_DIFFICULTY_PARAMS,
  TIMEOUT_WINDOWS_MS,
  COMBAT_PARAMS,
  MIND_RUSH_MODE_DETAILS,
  getMindRushComboMultiplier,
};
