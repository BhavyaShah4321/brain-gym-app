/**
 * OVERLOAD - Number Scan Evaluator
 * Evaluates visual search accuracy, hits, false alarms, and search latency.
 */

import { PROCESSING_MODES } from '../processingConstants.js';

export function evaluateNumberScanResponse({
  task,
  userSelectedIndices = [], // Array of selected cell indices or single index
  responseTimeMs = 0,
  isTimedOut = false,
}) {
  const level = task?.difficultyLevel || 1;
  const timeoutMs = task?.timeoutWindowMs || 4000;

  if (isTimedOut) {
    return {
      taskId: task?.taskId,
      mode: PROCESSING_MODES.NUMBER_SCAN,
      difficultyLevel: level,
      isCorrect: false,
      isTimedOut: true,
      responseTimeMs: timeoutMs,
      accuracy: 0,
      feedbackMessage: 'TIME EXPIRED',
      evaluatedAt: Date.now(),
    };
  }

  const selectedSet = new Set(
    Array.isArray(userSelectedIndices) ? userSelectedIndices : [userSelectedIndices]
  );
  const targetSet = new Set(task?.targetIndices || []);

  let hits = 0;
  let falseAlarms = 0;

  selectedSet.forEach((idx) => {
    if (targetSet.has(idx)) {
      hits += 1;
    } else {
      falseAlarms += 1;
    }
  });

  const isCorrect = hits === targetSet.size && falseAlarms === 0;
  const rawAcc = targetSet.size > 0 ? ((hits - falseAlarms * 0.5) / targetSet.size) * 100 : 0;
  const accuracy = Math.max(0, Math.min(100, Math.round(rawAcc)));

  return {
    taskId: task?.taskId,
    mode: PROCESSING_MODES.NUMBER_SCAN,
    difficultyLevel: level,
    isCorrect,
    isTimedOut: false,
    hits,
    falseAlarms,
    responseTimeMs: Math.max(1, responseTimeMs),
    accuracy,
    feedbackMessage: isCorrect ? `${Math.round(responseTimeMs)} ms` : 'TARGET MISMATCH',
    evaluatedAt: Date.now(),
  };
}

export default {
  evaluateNumberScanResponse,
};
