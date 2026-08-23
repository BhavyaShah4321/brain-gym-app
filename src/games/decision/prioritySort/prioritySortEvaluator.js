/**
 * OVERLOAD - Priority Sort Evaluator
 * Evaluates prioritization accuracy, trade-off quality, and decision latency.
 */

import { DECISION_MODES } from '../decisionConstants.js';

export function evaluatePrioritySortResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 7500;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: DECISION_MODES.PRIORITY_SORT,
      difficultyLevel: level,
      isCorrect: false,
      isTimedOut: true,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED',
      rationale: task?.rationale || 'Decision window exceeded.',
      evaluatedAt: Date.now(),
    };
  }

  const isCorrect = userChoiceId === task?.correctTaskId;
  const chosenTask = task?.tasks?.find((t) => t.id === userChoiceId);

  return {
    taskId: task?.taskId,
    mode: DECISION_MODES.PRIORITY_SORT,
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    chosenTaskId: userChoiceId,
    chosenTaskLetter: chosenTask?.letter || 'A',
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect ? 'CORRECT PRIORITY' : 'NOT QUITE',
    rationale: task?.rationale || '',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluatePrioritySortResponse,
};
