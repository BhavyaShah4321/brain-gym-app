/**
 * OVERLOAD - Blast Logic Evaluator
 * Evaluates target selection, explosion trigger, and combat impact.
 */

import { MIND_RUSH_MODES } from '../mindRushConstants.js';

export function evaluateBlastLogicResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || task?.difficulty || 1;
  const timeoutMs = task?.timeoutWindowMs || 7500;
  const correctId = task?.correctTargetId || (Array.isArray(task?.correctTargetIds) ? task.correctTargetIds[0] : null);

  if (isTimedOut) {
    return {
      taskId: task?.id || task?.taskId,
      mode: MIND_RUSH_MODES.BLAST_LOGIC,
      difficultyLevel: level,
      difficulty: level,
      isCorrect: false,
      isTimedOut: true,
      selectedTargetId: null,
      chosenOptionId: null,
      correctTargetIds: [correctId],
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TARGET ESCAPED',
      feedback: 'TARGET ESCAPED',
      evaluatedAt: Date.now(),
    };
  }

  const isCorrect = Boolean(userChoiceId && userChoiceId === correctId);

  return {
    taskId: task?.id || task?.taskId,
    mode: MIND_RUSH_MODES.BLAST_LOGIC,
    difficultyLevel: level,
    difficulty: level,
    isCorrect,
    isTimedOut: false,
    selectedTargetId: userChoiceId,
    chosenOptionId: userChoiceId,
    correctTargetIds: [correctId],
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect
      ? `TARGET DETONATED 💥 (${Math.round(responseTimeMs)} ms)`
      : 'MISFIRE · INVALID TARGET',
    feedback: isCorrect
      ? `TARGET DETONATED 💥 (${Math.round(responseTimeMs)} ms)`
      : 'MISFIRE · INVALID TARGET',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateBlastLogicResponse,
};
