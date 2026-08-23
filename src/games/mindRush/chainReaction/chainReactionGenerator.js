/**
 * OVERLOAD - Chain Reaction Task Generator & Invariant Validator
 * Procedural generation of sequential reasoning network puzzles with deterministic propagation.
 */

import { MIND_RUSH_MODES, TIMEOUT_WINDOWS_MS } from '../mindRushConstants.js';
import { CHAIN_RULE_TYPES, NODE_COLORS } from './chainReactionConstants.js';

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Propagates through the network from a given start node ID.
 * Returns an array of node IDs visited in order.
 */
export function traceChainPath(startNodeId, connectionsMap, maxDepth = 12) {
  const path = [startNodeId];
  const visited = new Set([startNodeId]);
  let current = startNodeId;

  while (path.length < maxDepth) {
    const nextNodes = connectionsMap[current] || [];
    const validNext = nextNodes.filter((nId) => !visited.has(nId));
    if (validNext.length === 0) break;

    // Deterministic forward edge follow
    const nextId = validNext[0];
    visited.add(nextId);
    path.push(nextId);
    current = nextId;
  }

  return path;
}

/**
 * Validates that a Chain Reaction puzzle has exactly one valid solution and no ambiguity.
 */
export function validateChainReactionTask(task) {
  if (!task || typeof task !== 'object') return false;
  if (!task.id && !task.taskId) return false;
  if (!task.objective || typeof task.objective !== 'string') return false;
  if (!Array.isArray(task.nodes) || task.nodes.length < 4) return false;
  if (!Array.isArray(task.connections)) return false;
  if (!Array.isArray(task.candidateStartNodes) || task.candidateStartNodes.length < 2) return false;

  const nodeMap = {};
  task.nodes.forEach((n) => {
    nodeMap[n.id] = n;
  });

  const connectionsMap = {};
  task.nodes.forEach((n) => {
    connectionsMap[n.id] = [];
  });
  task.connections.forEach(([from, to]) => {
    if (connectionsMap[from]) connectionsMap[from].push(to);
  });

  let validCandidatesCount = 0;
  let correctCandidateFound = false;

  for (const cand of task.candidateStartNodes) {
    const path = traceChainPath(cand.id, connectionsMap);
    let satisfiesObjective = false;

    if (task.ruleType === CHAIN_RULE_TYPES.TARGET_PATH) {
      satisfiesObjective = path.includes(task.targetDestinationNodeId);
    } else if (task.ruleType === CHAIN_RULE_TYPES.CHAIN_LENGTH) {
      satisfiesObjective = path.length === task.requiredChainLength;
    } else if (task.ruleType === CHAIN_RULE_TYPES.AVOID_NODE) {
      const reachesDest = path.includes(task.targetDestinationNodeId);
      const avoidsForbidden = !path.includes(task.forbiddenNodeId);
      satisfiesObjective = reachesDest && avoidsForbidden;
    } else if (task.ruleType === CHAIN_RULE_TYPES.ORDERED_TARGETS) {
      const colorSeq = path.map((nId) => nodeMap[nId]?.color?.name).filter(Boolean);
      const targetColors = task.requiredColorSequence || [];
      satisfiesObjective =
        targetColors.length <= colorSeq.length &&
        targetColors.every((c, idx) => colorSeq[idx] === c);
    } else if (task.ruleType === CHAIN_RULE_TYPES.MAXIMUM_CHAIN) {
      const maxLen = Math.max(
        ...task.candidateStartNodes.map((c) => traceChainPath(c.id, connectionsMap).length)
      );
      satisfiesObjective = path.length === maxLen;
    }

    if (satisfiesObjective) {
      validCandidatesCount++;
      if (cand.id === task.correctStartNodeId) {
        correctCandidateFound = true;
      }
    }
  }

  // Strict invariant: EXACTLY ONE candidate start node satisfies the puzzle objective
  return validCandidatesCount === 1 && correctCandidateFound;
}

/**
 * Generates an adaptive, validated Chain Reaction puzzle.
 */
export function generateChainReactionTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[MIND_RUSH_MODES.CHAIN_REACTION]?.[level] || 9000;

  // Available rule types based on difficulty
  const availableRules = [CHAIN_RULE_TYPES.TARGET_PATH, CHAIN_RULE_TYPES.CHAIN_LENGTH, CHAIN_RULE_TYPES.MAXIMUM_CHAIN];
  if (level >= 4) {
    availableRules.push(CHAIN_RULE_TYPES.AVOID_NODE);
  }
  if (level >= 6) {
    availableRules.push(CHAIN_RULE_TYPES.ORDERED_TARGETS);
  }

  for (let attempt = 0; attempt < 30; attempt++) {
    const taskId = `chain_r${roundNumber}_${Date.now()}_${attempt}_${Math.random().toString(36).substring(2, 6)}`;
    const selectedRuleType = pickRandom(availableRules);

    // Network Topology: 3 start branches merging into downstream layers
    // Layout in a normalized coordinate space (x: 20..280, y: 20..200)
    const nodes = [
      { id: 'node_A', label: 'A', x: 40, y: 35, color: NODE_COLORS[0], isStart: true },
      { id: 'node_B', label: 'B', x: 150, y: 35, color: NODE_COLORS[1], isStart: true },
      { id: 'node_C', label: 'C', x: 260, y: 35, color: NODE_COLORS[2], isStart: true },
      { id: 'node_D', label: 'D', x: 80, y: 110, color: NODE_COLORS[3], isStart: false },
      { id: 'node_E', label: 'E', x: 220, y: 110, color: NODE_COLORS[4], isStart: false },
      { id: 'node_F', label: 'F', x: 150, y: 185, color: NODE_COLORS[5], isStart: false },
    ];

    let connections = [];
    let objective = '';
    let correctStartId = '';
    let targetDestId = null;
    let forbiddenId = null;
    let requiredLen = null;
    let reqColors = null;

    if (selectedRuleType === 'TARGET_PATH') {
      // Path 1: A -> D -> F
      // Path 2: B -> E
      // Path 3: C -> E
      connections = [
        ['node_A', 'node_D'],
        ['node_D', 'node_F'],
        ['node_B', 'node_E'],
        ['node_C', 'node_E'],
      ];
      targetDestId = 'node_F';
      correctStartId = 'node_A';
      objective = 'REACH DESTINATION TARGET (F)';
    } else if (selectedRuleType === 'CHAIN_LENGTH') {
      // Path A: A -> D (len 2)
      // Path B: B -> E -> F (len 3)
      // Path C: C -> (len 1)
      connections = [
        ['node_A', 'node_D'],
        ['node_B', 'node_E'],
        ['node_E', 'node_F'],
      ];
      requiredLen = 3;
      correctStartId = 'node_B';
      objective = 'CREATE A CHAIN OF EXACTLY 3 NODES';
    } else if (selectedRuleType === 'AVOID_NODE') {
      // Path A: A -> D -> F (D is forbidden)
      // Path B: B -> E -> F (clean path)
      // Path C: C -> E (doesn't reach F)
      connections = [
        ['node_A', 'node_D'],
        ['node_D', 'node_F'],
        ['node_B', 'node_E'],
        ['node_E', 'node_F'],
      ];
      nodes.find((n) => n.id === 'node_D').color = NODE_COLORS[5]; // Rose/Red
      forbiddenId = 'node_D';
      targetDestId = 'node_F';
      correctStartId = 'node_B';
      objective = 'REACH (F) WITHOUT ACTIVATING RED NODE (D)';
    } else if (selectedRuleType === 'ORDERED_TARGETS') {
      // Path A: BLUE (A) -> VIOLET (D) -> ROSE (F)
      // Path B: GOLD (B) -> EMERALD (E) -> ROSE (F)
      // Path C: CYAN (C) -> EMERALD (E)
      connections = [
        ['node_A', 'node_D'],
        ['node_D', 'node_F'],
        ['node_B', 'node_E'],
        ['node_E', 'node_F'],
        ['node_C', 'node_E'],
      ];
      reqColors = ['BLUE', 'VIOLET', 'ROSE'];
      correctStartId = 'node_A';
      objective = 'ACTIVATE: BLUE → VIOLET → ROSE';
    } else {
      // MAXIMUM_CHAIN
      // Path A: A -> D (len 2)
      // Path B: B -> E -> F (len 3) - MAX
      // Path C: C -> (len 1)
      connections = [
        ['node_A', 'node_D'],
        ['node_B', 'node_E'],
        ['node_E', 'node_F'],
      ];
      correctStartId = 'node_B';
      objective = 'ACTIVATE THE LONGEST VALID CHAIN';
    }

    const candidateStartNodes = nodes.filter((n) => n.isStart);
    const connectionsMap = {};
    nodes.forEach((n) => {
      connectionsMap[n.id] = [];
    });
    connections.forEach(([f, t]) => {
      if (connectionsMap[f]) connectionsMap[f].push(t);
    });

    const solutionPath = traceChainPath(correctStartId, connectionsMap);

    const task = {
      id: taskId,
      taskId,
      mode: MIND_RUSH_MODES.CHAIN_REACTION,
      difficulty: level,
      difficultyLevel: level,
      roundNumber,
      timeoutWindowMs,
      ruleType: selectedRuleType,
      objective,
      nodes,
      connections,
      candidateStartNodes,
      correctStartNodeId: correctStartId,
      correctStartNodeIds: [correctStartId],
      solutionPath,
      chainLength: solutionPath.length,
      targetDestinationNodeId: targetDestId,
      forbiddenNodeId: forbiddenId,
      requiredChainLength: requiredLen,
      requiredColorSequence: reqColors,
      instructionText: 'PLAN CHAIN SEQUENCE',
      actionPrompt: objective,
      createdAt: Date.now(),
    };

    if (validateChainReactionTask(task)) {
      return task;
    }
  }

  // High-reliability validated fallback
  const fallbackTaskId = `chain_fb_${Date.now()}`;
  const fallbackNodes = [
    { id: 'node_A', label: 'A', x: 40, y: 35, color: NODE_COLORS[0], isStart: true },
    { id: 'node_B', label: 'B', x: 150, y: 35, color: NODE_COLORS[1], isStart: true },
    { id: 'node_C', label: 'C', x: 260, y: 35, color: NODE_COLORS[2], isStart: true },
    { id: 'node_D', label: 'D', x: 80, y: 110, color: NODE_COLORS[3], isStart: false },
    { id: 'node_E', label: 'E', x: 220, y: 110, color: NODE_COLORS[4], isStart: false },
    { id: 'node_F', label: 'F', x: 150, y: 185, color: NODE_COLORS[5], isStart: false },
  ];
  const fallbackConnections = [
    ['node_A', 'node_D'],
    ['node_D', 'node_F'],
    ['node_B', 'node_E'],
    ['node_C', 'node_E'],
  ];

  return {
    id: fallbackTaskId,
    taskId: fallbackTaskId,
    mode: MIND_RUSH_MODES.CHAIN_REACTION,
    difficulty: level,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    ruleType: CHAIN_RULE_TYPES.TARGET_PATH,
    objective: 'REACH DESTINATION TARGET (F)',
    nodes: fallbackNodes,
    connections: fallbackConnections,
    candidateStartNodes: fallbackNodes.filter((n) => n.isStart),
    correctStartNodeId: 'node_A',
    correctStartNodeIds: ['node_A'],
    solutionPath: ['node_A', 'node_D', 'node_F'],
    chainLength: 3,
    targetDestinationNodeId: 'node_F',
    forbiddenNodeId: null,
    requiredChainLength: null,
    requiredColorSequence: null,
    instructionText: 'PLAN CHAIN SEQUENCE',
    actionPrompt: 'REACH DESTINATION TARGET (F)',
    createdAt: Date.now(),
  };
}

export default {
  traceChainPath,
  validateChainReactionTask,
  generateChainReactionTask,
};
