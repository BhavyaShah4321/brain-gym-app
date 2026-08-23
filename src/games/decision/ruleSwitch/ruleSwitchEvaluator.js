/**
 * OVERLOAD - Rule Switch Evaluator
 * Evaluates cognitive flexibility and rule-switching accuracy.
 */

export function evaluateRuleSwitchResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 5000;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: 'rule_switch',
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
    mode: 'rule_switch',
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    chosenOptionId: userChoiceId,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect ? `${Math.round(responseTimeMs)} ms` : 'RULE MISMATCH',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateRuleSwitchResponse,
};
