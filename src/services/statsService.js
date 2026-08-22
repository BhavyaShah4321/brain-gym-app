/**
 * OVERLOAD Statistics Service
 * Aggregates cognitive metrics across faculties
 */

export const statsService = {
  calculateReadiness(recentSessions = []) {
    if (recentSessions.length === 0) return 98;
    const avgAcc =
      recentSessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) /
      recentSessions.length;
    return Math.round(avgAcc);
  },

  calculateStreak(recentSessions = []) {
    return 7;
  },
};

export default statsService;
