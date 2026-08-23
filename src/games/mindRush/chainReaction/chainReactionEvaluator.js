/**
 * OVERLOAD - Chain Reaction Evaluator
 * Evaluates start node selection, propagation path, and chain multipliers.
 */

import { MIND_RUSH_MODES } from '../mindRushConstants.js';

export function evaluateChainReactionResponse({
  task,
  userChoiceId = null,
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || task?.difficulty || 1;
  const timeoutMs = task?.timeoutWindowMs || 9000;
  const correctId = task?.correctStartNodeId;
  const solutionPath = task?.solutionPath || [];
  const chainLength = solutionPath.length || task?.chainLength || 1;

  if (isTimedOut) {
    return {
      taskId: task?.id || task?.taskId,
      mode: MIND_RUSH_MODES.CHAIN_REACTION,
      difficultyLevel: level,
      difficulty: level,
      isCorrect: false,
      isTimedOut: true,
      selectedNodeId: null,
      correctStartNodeId: correctId,
      solutionPath: [],
      chainCount: 0,
      chainLength: 0,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED · CHAIN DORMANT',
      feedback: 'TIME EXPIRED · CHAIN DORMANT',
      evaluatedAt: Date.now(),
    };
  }

  const isCorrect = Boolean(userChoiceId && userChoiceId === correctId);

  return {
    taskId: task?.id || task?.taskId,
    mode: MIND_RUSH_MODES.CHAIN_REACTION,
    difficultyLevel: level,
    difficulty: level,
    isCorrect,
    isTimedOut: false,
    selectedNodeId: userChoiceId,
    chosenOptionId: userChoiceId,
    correctStartNodeId: correctId,
    solutionPath: isCorrect ? solutionPath : [],
    chainCount: isCorrect ? chainLength : 0,
    chainLength: isCorrect ? chainLength : 0,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy: isCorrect ? 100 : 0,
    feedbackMessage: isCorrect
      ? `CHAIN PROPAGATED x${chainLength} 💥 (${Math.round(responseTimeMs)} ms)`
      : 'CHAIN BROKEN · WRONG STARTING NODE',
    feedback: isCorrect
      ? `CHAIN PROPAGATED x${chainLength} 💥 (${Math.round(responseTimeMs)} ms)`
      : 'CHAIN BROKEN · WRONG STARTING NODE',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateChainReactionResponse,
};
