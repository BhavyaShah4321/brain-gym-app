/**
 * OVERLOAD - Priority Sort Task Generator
 * Procedural generation for multi-criteria prioritization with strict single-solution verification.
 */

import { DECISION_MODES, TIMEOUT_WINDOWS_MS } from '../decisionConstants.js';

const TASK_TEMPLATES = [
  { title: 'Fix database connection outage', baseImportance: 'CRITICAL', baseUrgency: 'IMMEDIATE', deadline: '15 min', impact: 'CRITICAL', blocks: true },
  { title: 'Review security audit patch', baseImportance: 'HIGH', baseUrgency: 'HIGH', deadline: '45 min', impact: 'HIGH', blocks: true },
  { title: 'Submit quarterly budget report', baseImportance: 'HIGH', baseUrgency: 'MEDIUM', deadline: '3 hours', impact: 'HIGH', blocks: false },
  { title: 'Respond to client status inquiry', baseImportance: 'MEDIUM', baseUrgency: 'HIGH', deadline: '30 min', impact: 'MEDIUM', blocks: false },
  { title: 'Update documentation diagrams', baseImportance: 'LOW', baseUrgency: 'LOW', deadline: 'Tomorrow', impact: 'LOW', blocks: false },
  { title: 'Renew SSL domain certificate', baseImportance: 'CRITICAL', baseUrgency: 'HIGH', deadline: '1 hour', impact: 'CRITICAL', blocks: true },
  { title: 'Resolve user authentication bug', baseImportance: 'HIGH', baseUrgency: 'IMMEDIATE', deadline: '20 min', impact: 'HIGH', blocks: true },
  { title: 'Organize team archive files', baseImportance: 'LOW', baseUrgency: 'LOW', deadline: 'No deadline', impact: 'LOW', blocks: false },
  { title: 'Deploy critical hotfix patch', baseImportance: 'CRITICAL', baseUrgency: 'IMMEDIATE', deadline: '10 min', impact: 'CRITICAL', blocks: true },
  { title: 'Prepare presentation slides', baseImportance: 'MEDIUM', baseUrgency: 'MEDIUM', deadline: 'Tomorrow', impact: 'MEDIUM', blocks: false },
  { title: 'Approve vendor expense invoice', baseImportance: 'MEDIUM', baseUrgency: 'LOW', deadline: '2 days', impact: 'LOW', blocks: false },
  { title: 'Investigate payment gateway timeout', baseImportance: 'HIGH', baseUrgency: 'HIGH', deadline: '25 min', impact: 'HIGH', blocks: true },
];

const WEIGHTS = {
  importance: { CRITICAL: 140, HIGH: 105, MEDIUM: 70, LOW: 35 },
  urgency: { IMMEDIATE: 120, HIGH: 90, MEDIUM: 60, LOW: 30 },
  deadline: { '10 min': 100, '15 min': 100, '20 min': 95, '25 min': 90, '30 min': 85, '45 min': 75, '1 hour': 70, '3 hours': 50, 'Tomorrow': 25, '2 days': 15, 'No deadline': 10 },
  impact: { CRITICAL: 80, HIGH: 60, MEDIUM: 40, LOW: 20 },
  blocks: { true: 45, false: 0 },
};

function calculateTaskPriority(task) {
  const impScore = WEIGHTS.importance[task.importance] || 70;
  const urgScore = WEIGHTS.urgency[task.urgency] || 60;
  const dlScore = WEIGHTS.deadline[task.deadline] || 25;
  const impctScore = WEIGHTS.impact[task.impact] || 40;
  const blkScore = WEIGHTS.blocks[task.blocksDependency] || 0;

  return impScore + urgScore + dlScore + impctScore + blkScore;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generatePrioritySortTask({
  difficultyLevel = 1,
  roundNumber = 1,
} = {}) {
  const level = Math.max(1, Math.min(10, difficultyLevel));
  const timeoutWindowMs =
    TIMEOUT_WINDOWS_MS[DECISION_MODES.PRIORITY_SORT]?.[level] || 7500;
  const taskId = `priority_r${roundNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Task count: 3 (level 1-3), 4 (level 4-7), 5 (level 8-10)
  const taskCount = level <= 3 ? 3 : level <= 7 ? 4 : 5;

  let attempts = 0;
  while (attempts < 50) {
    attempts++;
    const shuffledTemplates = shuffle(TASK_TEMPLATES).slice(0, taskCount);

    const tasks = shuffledTemplates.map((t, idx) => {
      const taskObj = {
        id: `task_${idx}`,
        letter: String.fromCharCode(65 + idx),
        title: t.title,
        importance: t.baseImportance,
        urgency: t.baseUrgency,
        deadline: t.deadline,
        impact: t.impact,
        blocksDependency: t.blocks,
      };
      taskObj.priorityScore = calculateTaskPriority(taskObj);
      return taskObj;
    });

    const maxScore = Math.max(...tasks.map((t) => t.priorityScore));
    const winners = tasks.filter((t) => t.priorityScore === maxScore);

    // Verify exactly one unambiguous winner with a clear margin
    if (winners.length === 1) {
      const winner = winners[0];
      const rationale = `${winner.importance} importance and ${winner.urgency.toLowerCase()} urgency made this the highest priority.`;

      return {
        taskId,
        mode: DECISION_MODES.PRIORITY_SORT,
        difficultyLevel: level,
        roundNumber,
        timeoutWindowMs,
        tasks,
        correctTaskId: winner.id,
        correctTaskLetter: winner.letter,
        correctTaskTitle: winner.title,
        rationale,
        instructionText: 'EVALUATE COMPETING PRIORITIES',
        actionPrompt: 'WHICH TASK SHOULD YOU PRIORITIZE FIRST?',
        createdAt: Date.now(),
      };
    }
  }

  // Safe fallback
  const fallbackTasks = [
    { id: 'task_0', letter: 'A', title: 'Fix payment error', importance: 'CRITICAL', urgency: 'IMMEDIATE', deadline: '15 min', impact: 'CRITICAL', blocksDependency: true, priorityScore: 485 },
    { id: 'task_1', letter: 'B', title: 'Submit assignment', importance: 'HIGH', urgency: 'MEDIUM', deadline: '3 hours', impact: 'HIGH', blocksDependency: false, priorityScore: 285 },
    { id: 'task_2', letter: 'C', title: 'Read article', importance: 'LOW', urgency: 'LOW', deadline: 'No deadline', impact: 'LOW', blocksDependency: false, priorityScore: 105 },
  ];

  return {
    taskId,
    mode: DECISION_MODES.PRIORITY_SORT,
    difficultyLevel: level,
    roundNumber,
    timeoutWindowMs,
    tasks: fallbackTasks,
    correctTaskId: 'task_0',
    correctTaskLetter: 'A',
    correctTaskTitle: 'Fix payment error',
    rationale: 'Critical impact and immediate urgency made this the highest priority.',
    instructionText: 'EVALUATE COMPETING PRIORITIES',
    actionPrompt: 'WHICH TASK SHOULD YOU PRIORITIZE FIRST?',
    createdAt: Date.now(),
  };
}

export default {
  generatePrioritySortTask,
};
