/**
 * OVERLOAD - Dual Rule Evaluator
 * Evaluates context-dependent rule execution and decision latency.
 */

import { FLEXIBILITY_MODES } from '../flexibilityConstants.js';

export function evaluateDualRuleResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 6500;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: FLEXIBILITY_MODES.DUAL_RULE,
      difficultyLevel: level,
      isCorrect: false,
      isTimedOut: true,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED',
      evaluatedAt: Date.now(),
    };
  }

  const isCorrect = userChoiceId === task?.correctOptionId;

  return {
    taskId: task?.taskId,
    mode: FLEXIBILITY_MODES.DUAL_RULE,
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    chosenOptionId: userChoiceId,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect ? `${Math.round(responseTimeMs)} ms` : 'WRONG RULE APPLIED',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateDualRuleResponse,
};
