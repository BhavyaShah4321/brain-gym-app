/**
 * OVERLOAD - Best Choice Evaluator
 * Evaluates goal-directed multi-attribute optimization decisions and latency.
 */

export function evaluateBestChoiceResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 6000;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: 'best_choice',
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
    mode: 'best_choice',
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    chosenOptionId: userChoiceId,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect ? `${Math.round(responseTimeMs)} ms` : 'NON-OPTIMAL CHOICE',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateBestChoiceResponse,
};
