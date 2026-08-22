/**
 * OVERLOAD - Memory Engine Constants
 * Constants, stimuli definitions, timing limits, and combo multipliers
 * for the Complete Working Memory faculty (4 distinct games).
 */

export const MEMORY_MODES = {
  SEQUENCE_RECALL: 'sequence_recall',
  GRID_MEMORY: 'grid_memory',
  OBJECT_RECALL: 'object_recall',
  ORDER_RECALL: 'order_recall',
};

export const SESSION_TYPES = {
  QUICK: 'quick',        // 10 rounds
  STANDARD: 'standard',   // 20 rounds
  ENDLESS: 'endless',    // Unlimited rounds
};

export const DEFAULT_DIFFICULTY_PARAMS = {
  initialSpan: 3,
  minSpan: 2,
  maxSpan: 9,
  quickRounds: 10,
  standardRounds: 20,
};

// Mode metadata definitions
export const MEMORY_MODE_DETAILS = {
  [MEMORY_MODES.SEQUENCE_RECALL]: {
    id: MEMORY_MODES.SEQUENCE_RECALL,
    name: 'Sequence Recall',
    metricName: 'Span Capacity',
    description: 'Observe highlighted grid sequences and reproduce the exact sequential order.',
    instruction: 'Remember the serial sequence',
    recallInstruction: 'Tap cells in sequential order',
  },
  [MEMORY_MODES.GRID_MEMORY]: {
    id: MEMORY_MODES.GRID_MEMORY,
    name: 'Grid Memory',
    metricName: 'Spatial Retention',
    description: 'Memorize spatial geometric matrices illuminated simultaneously.',
    instruction: 'Remember highlighted positions',
    recallInstruction: 'Select all highlighted cells',
  },
  [MEMORY_MODES.OBJECT_RECALL]: {
    id: MEMORY_MODES.OBJECT_RECALL,
    name: 'Object Recall',
    metricName: 'Recognition Precision',
    description: 'Retain visual symbol features and identify original targets amidst distractors.',
    instruction: 'Memorize the target objects',
    recallInstruction: 'Select only the original objects',
  },
  [MEMORY_MODES.ORDER_RECALL]: {
    id: MEMORY_MODES.ORDER_RECALL,
    name: 'Order Recall',
    metricName: 'Temporal Ordering',
    description: 'Reconstruct the original temporal arrangement from shuffled elements.',
    instruction: 'Memorize the item order',
    recallInstruction: 'Reconstruct the original sequence',
  },
};

// Visual stimuli shapes for Object Recall & Order Recall
export const MEMORY_SHAPES = [
  { id: 'triangle', symbol: '▲', name: 'Triangle' },
  { id: 'circle', symbol: '●', name: 'Circle' },
  { id: 'square', symbol: '■', name: 'Square' },
  { id: 'star', symbol: '★', name: 'Star' },
  { id: 'diamond', symbol: '◆', name: 'Diamond' },
  { id: 'hexagon', symbol: '⬢', name: 'Hexagon' },
  { id: 'cross', symbol: '✚', name: 'Cross' },
  { id: 'inverted_triangle', symbol: '▼', name: 'Inverted Triangle' },
];

// Luxury color tokens for visual stimuli
export const MEMORY_COLORS = [
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Gold', hex: '#C5A55A' },
  { name: 'Sage', hex: '#6B8F71' },
  { name: 'Rose', hex: '#C4787A' },
  { name: 'Slate', hex: '#4A5B78' },
  { name: 'Plum', hex: '#7A5A82' },
];

// Combo multiplier calculation (1.0x to 1.5x cap)
export function getMemoryComboMultiplier(combo) {
  if (combo >= 15) return 1.5;
  if (combo >= 12) return 1.4;
  if (combo >= 9) return 1.3;
  if (combo >= 6) return 1.2;
  if (combo >= 3) return 1.1;
  return 1.0;
}

export default {
  MEMORY_MODES,
  SESSION_TYPES,
  DEFAULT_DIFFICULTY_PARAMS,
  MEMORY_MODE_DETAILS,
  MEMORY_SHAPES,
  MEMORY_COLORS,
  getMemoryComboMultiplier,
};
