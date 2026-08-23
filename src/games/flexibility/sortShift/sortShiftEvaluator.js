/**
 * OVERLOAD - Sort Shift Evaluator
 * Evaluates mental set shifting accuracy, post-switch adaptation, and decision latency.
 */

import { FLEXIBILITY_MODES } from '../flexibilityConstants.js';

export function evaluateSortShiftResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 6000;
  const isRuleShiftTrial = Boolean(task?.isRuleShiftTrial);

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: FLEXIBILITY_MODES.SORT_SHIFT,
      difficultyLevel: level,
      isCorrect: false,
      isTimedOut: true,
      isRuleShiftTrial,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED',
      evaluatedAt: Date.now(),
    };
  }

  const isCorrect = userChoiceId === task?.correctOptionId;

  return {
    taskId: task?.taskId,
    mode: FLEXIBILITY_MODES.SORT_SHIFT,
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    isRuleShiftTrial,
    chosenOptionId: userChoiceId,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect
      ? isRuleShiftTrial
        ? 'PERFECT SHIFT'
        : `${Math.round(responseTimeMs)} ms`
      : 'RULE MISMATCH',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateSortShiftResponse,
};
