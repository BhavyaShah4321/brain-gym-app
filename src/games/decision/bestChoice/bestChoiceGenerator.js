/**
 * OVERLOAD - Best Choice Task Generator
 * Procedural generation for constraint-based multi-attribute optimization
 * with strict single-solution ambiguity prevention.
 */

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function generateBestChoiceTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs = 8000 - (level - 1) * 450;
  const taskId = `choice_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const optionCount = level <= 4 ? 3 : 4;
  const objectiveTypes = ['HIGHEST_VALUE_UNDER_COST', 'LOWEST_COST_OVER_VALUE'];
  if (level >= 4) objectiveTypes.push('MAX_VALUE_LOW_RISK', 'HIGHEST_EFFICIENCY');

  let attempts = 0;
  while (attempts < 50) {
    attempts++;
    const objectiveType = pickRandom(objectiveTypes);
    let rulePrompt = '';
    let constraintValue = 0;

    const options = [];
    for (let i = 0; i < optionCount; i++) {
      options.push({
        id: `opt_${i}`,
        letter: String.fromCharCode(65 + i),
        value: getRandomInt(40, 98),
        cost: getRandomInt(30, 110),
        risk: pickRandom(['LOW', 'MEDIUM', 'HIGH']),
      });
    }

    let correctOptionId = null;

    if (objectiveType === 'HIGHEST_VALUE_UNDER_COST') {
      constraintValue = getRandomInt(65, 95);
      rulePrompt = `HIGHEST VALUE WITH COST UNDER ${constraintValue}`;

      const eligible = options.filter((o) => o.cost < constraintValue);
      if (eligible.length >= 1) {
        const maxValue = Math.max(...eligible.map((o) => o.value));
        const winners = eligible.filter((o) => o.value === maxValue);
        if (winners.length === 1) {
          correctOptionId = winners[0].id;
        }
      }
    } else if (objectiveType === 'LOWEST_COST_OVER_VALUE') {
      constraintValue = getRandomInt(60, 85);
      rulePrompt = `LOWEST COST WITH VALUE AT LEAST ${constraintValue}`;

      const eligible = options.filter((o) => o.value >= constraintValue);
      if (eligible.length >= 1) {
        const minCost = Math.min(...eligible.map((o) => o.cost));
        const winners = eligible.filter((o) => o.cost === minCost);
        if (winners.length === 1) {
          correctOptionId = winners[0].id;
        }
      }
    } else if (objectiveType === 'MAX_VALUE_LOW_RISK') {
      rulePrompt = 'HIGHEST VALUE WITH LOW RISK';

      const eligible = options.filter((o) => o.risk === 'LOW');
      if (eligible.length >= 1) {
        const maxValue = Math.max(...eligible.map((o) => o.value));
        const winners = eligible.filter((o) => o.value === maxValue);
        if (winners.length === 1) {
          correctOptionId = winners[0].id;
        }
      }
    } else {
      // HIGHEST_EFFICIENCY: Value / Cost ratio
      rulePrompt = 'HIGHEST EFFICIENCY (VALUE ÷ COST)';

      const efficiencies = options.map((o) => ({ ...o, eff: o.value / o.cost }));
      const maxEff = Math.max(...efficiencies.map((o) => o.eff));
      const winners = efficiencies.filter((o) => Math.abs(o.eff - maxEff) < 0.01);
      if (winners.length === 1) {
        correctOptionId = winners[0].id;
      }
    }

    // Ambiguity Prevention Guard: exactly one winner
    if (correctOptionId) {
      return {
        taskId,
        mode: 'best_choice',
        difficultyLevel: level,
        roundNumber,
        timeoutWindowMs,
        objectiveType,
        rulePrompt,
        options,
        correctOptionId,
        instructionText: 'OPTIMIZE TARGET OBJECTIVE',
        actionPrompt: rulePrompt,
        createdAt: Date.now(),
      };
    }
  }

  // Safe fallback if max attempts reached
  const fallbackOptions = [
    { id: 'opt_0', letter: 'A', value: 85, cost: 50, risk: 'LOW' },
    { id: 'opt_1', letter: 'B', value: 92, cost: 110, risk: 'HIGH' },
    { id: 'opt_2', letter: 'C', value: 70, cost: 40, risk: 'MEDIUM' },
  ];

  return {
    taskId,
    mode: 'best_choice',
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    objectiveType: 'HIGHEST_VALUE_UNDER_COST',
    rulePrompt: 'HIGHEST VALUE WITH COST UNDER 100',
    options: fallbackOptions,
    correctOptionId: 'opt_0',
    instructionText: 'OPTIMIZE TARGET OBJECTIVE',
    actionPrompt: 'HIGHEST VALUE WITH COST UNDER 100',
    createdAt: Date.now(),
  };
}

export default {
  generateBestChoiceTask,
};
