/**
 * OVERLOAD Performance Calculation Layer - Cognitive Index
 *
 * Deterministic, rules-based calculation for the application's Cognitive Performance Index.
 * Note: This metric represents application training proficiency and consistency.
 * It is NOT a medically or scientifically validated clinical diagnostic index.
 */

/**
 * Calculates overall Cognitive Performance Index (0 to 1000 scale).
 *
 * Formula components:
 * 1. Accuracy Component (0 - 400 pts): Weighted average accuracy across completed sessions.
 * 2. Latency Component (0 - 300 pts): Inverse scale from response time (faster = higher score).
 *    Baseline target: <= 200ms yields full 300pts; >= 1200ms yields minimum 50pts.
 * 3. Span Component (0 - 200 pts): Max working memory span achieved (each span unit above 2 adds points).
 * 4. Volume / Consistency Bonus (0 - 100 pts): Progressive bonus based on total sessions completed (capped at 50 sessions).
 *
 * @param {Object} params
 * @param {number} params.averageAccuracy - Overall average accuracy (0 to 100)
 * @param {number} params.averageLatencyMs - Mean response time in milliseconds
 * @param {number} params.maxSpan - Peak memory span achieved (e.g. 3, 4, 5...)
 * @param {number} params.totalSessions - Total number of drills completed
 * @returns {number} Integer cognitive index between 0 and 1000
 */
export function calculateCognitiveIndex({
  averageAccuracy = 0,
  averageLatencyMs = 0,
  maxSpan = 3,
  totalSessions = 0,
} = {}) {
  if (totalSessions <= 0) {
    return 0;
  }

  // 1. Accuracy (max 400 pts)
  const clampedAccuracy = Math.max(0, Math.min(100, averageAccuracy));
  const accuracyScore = (clampedAccuracy / 100) * 400;

  // 2. Latency (max 300 pts)
  let latencyScore = 100;
  if (averageLatencyMs > 0) {
    // 200ms = 300pts, 1200ms = 50pts
    const normalizedLatency = Math.max(0, Math.min(1, (1200 - averageLatencyMs) / 1000));
    latencyScore = 50 + normalizedLatency * 250;
  }

  // 3. Span (max 200 pts)
  // Span 3 = 100pts, Span 7+ = 200pts
  const clampedSpan = Math.max(1, Math.min(8, maxSpan));
  const spanScore = Math.min(200, (clampedSpan / 7) * 200);

  // 4. Volume / Consistency Bonus (max 100 pts)
  const volumeBonus = Math.min(100, totalSessions * 2);

  const rawTotal = accuracyScore + latencyScore + spanScore + volumeBonus;
  return Math.max(50, Math.min(1000, Math.round(rawTotal)));
}

/**
 * Calculates Cognitive Readiness Percentage (0% to 100%).
 * Evaluates recent performance (e.g. last 5 sessions) compared to baseline.
 *
 * @param {Object} params
 * @param {number} params.recentAccuracy - Mean accuracy of last sessions
 * @param {number} params.streak - Current active streak
 * @param {number} params.totalSessions - Total completed sessions
 * @returns {number} Readiness percentage (0 - 100)
 */
export function calculateCognitiveReadiness({
  recentAccuracy = 0,
  streak = 0,
  totalSessions = 0,
} = {}) {
  if (totalSessions <= 0) {
    return 0;
  }

  const baseAcc = Math.max(0, Math.min(100, recentAccuracy));
  const streakBonus = Math.min(10, streak * 2);
  const readiness = Math.min(100, Math.round(baseAcc * 0.9 + streakBonus));
  return readiness;
}

export default {
  calculateCognitiveIndex,
  calculateCognitiveReadiness,
};
