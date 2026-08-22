/**
 * OVERLOAD Calendar-Day Streak Calculator
 *
 * Evaluates daily training streaks based on local calendar dates (YYYY-MM-DD).
 * Multiple drills completed on the same date will not increment streak multiple times.
 * Skipping a calendar day resets current streak to 1 upon completing a new session.
 */

/**
 * Returns formatted calendar date string (YYYY-MM-DD) for a Date object or timestamp.
 * Uses the user's local timezone.
 *
 * @param {Date|number} date
 * @returns {string} e.g. "2026-08-22"
 */
export function getLocalDateString(date = new Date()) {
  const d = typeof date === 'number' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates days between two YYYY-MM-DD date strings.
 *
 * @param {string} dateStrA - e.g. "2026-08-21"
 * @param {string} dateStrB - e.g. "2026-08-22"
 * @returns {number} Difference in days (dateStrB - dateStrA)
 */
export function getDaysDifference(dateStrA, dateStrB) {
  if (!dateStrA || !dateStrB) return Infinity;
  const a = new Date(`${dateStrA}T00:00:00`);
  const b = new Date(`${dateStrB}T00:00:00`);
  const diffMs = b.getTime() - a.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Computes updated streak metrics when a session is completed.
 *
 * @param {Object} params
 * @param {number} params.currentStreak - Existing active streak count
 * @param {number} params.bestStreak - Historical best streak count
 * @param {string|null} params.lastTrainingDate - Last training date string "YYYY-MM-DD"
 * @param {Date} [params.nowDate] - Optional current date override for testing
 * @returns {Object} Updated streak result: { currentStreak, bestStreak, lastTrainingDate, isNewDay }
 */
export function updateStreakOnSessionComplete({
  currentStreak = 0,
  bestStreak = 0,
  lastTrainingDate = null,
  nowDate = new Date(),
} = {}) {
  const todayStr = getLocalDateString(nowDate);

  if (!lastTrainingDate) {
    // First ever session
    const newStreak = 1;
    return {
      currentStreak: newStreak,
      bestStreak: Math.max(bestStreak, newStreak),
      lastTrainingDate: todayStr,
      isNewDay: true,
    };
  }

  const daysDiff = getDaysDifference(lastTrainingDate, todayStr);

  if (daysDiff === 0) {
    // Already played today -> streak remains the same
    return {
      currentStreak: Math.max(1, currentStreak),
      bestStreak: Math.max(bestStreak, currentStreak),
      lastTrainingDate: todayStr,
      isNewDay: false,
    };
  } else if (daysDiff === 1) {
    // Played yesterday -> streak increments by 1
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      bestStreak: Math.max(bestStreak, newStreak),
      lastTrainingDate: todayStr,
      isNewDay: true,
    };
  } else {
    // Missed at least 1 day -> reset streak to 1
    const newStreak = 1;
    return {
      currentStreak: newStreak,
      bestStreak: Math.max(bestStreak, newStreak),
      lastTrainingDate: todayStr,
      isNewDay: true,
    };
  }
}

/**
 * Evaluates current active streak for display (checks if user already missed yesterday).
 *
 * @param {Object} params
 * @param {number} params.currentStreak
 * @param {string|null} params.lastTrainingDate
 * @param {Date} [params.nowDate]
 * @returns {number} Active streak count (0 if more than 1 day has passed without training)
 */
export function getActiveDisplayStreak({
  currentStreak = 0,
  lastTrainingDate = null,
  nowDate = new Date(),
} = {}) {
  if (!lastTrainingDate || currentStreak <= 0) return 0;
  const todayStr = getLocalDateString(nowDate);
  const daysDiff = getDaysDifference(lastTrainingDate, todayStr);

  // If played today (0) or yesterday (1), streak is still active
  if (daysDiff <= 1) {
    return currentStreak;
  }
  // Missed yesterday and today without training
  return 0;
}

export default {
  getLocalDateString,
  getDaysDifference,
  updateStreakOnSessionComplete,
  getActiveDisplayStreak,
};
