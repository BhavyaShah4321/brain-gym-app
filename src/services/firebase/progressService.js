/**
 * OVERLOAD Progress & Statistics Calculation Service
 * Manages faculty subcollections, rolling performance averages, streaks,
 * and total drill counts in Firestore.
 */

import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { saveGameSession } from './gameSessionService';
import { updateUserProfile } from './userService';
import { updateStreakOnSessionComplete } from '../../utils/performance/streakCalculator';
import {
  calculateCognitiveIndex,
  calculateCognitiveReadiness,
} from '../../utils/performance/cognitiveIndex';

/**
 * Records a completed game session, updates faculty telemetry,
 * and recalculates user-level aggregates (streak, total drills, cognitive index).
 *
 * @param {string} uid - User ID
 * @param {Object} sessionData - Completed session metrics from engine
 * @returns {Promise<Object>} Updated user summary stats
 */
export async function recordSessionAndRecalculate(uid, sessionData) {
  if (!uid) {
    throw new Error('User ID required to record training progress.');
  }

  const facultyId = sessionData.facultyId || 'memory';
  const sessionScore = Number(sessionData.score) || 0;
  const sessionAccuracy = Number(sessionData.accuracy) || 0;
  const sessionLatency = Number(sessionData.latency) || 0;
  const sessionSpan = Number(sessionData.span) || 3;

  // 1. Persist session record asynchronously
  await saveGameSession(uid, sessionData);

  // 2. Fetch or initialize faculty document: users/{uid}/faculties/{facultyId}
  const facultyRef = doc(db, 'users', uid, 'faculties', facultyId);
  const facultySnap = await getDoc(facultyRef);

  let facultyData = {
    facultyId,
    level: 1,
    metrics: {
      score: sessionScore,
      accuracy: sessionAccuracy,
      averageLatency: sessionLatency,
      bestScore: sessionScore,
      peakSpan: sessionSpan,
    },
    totalSessions: 1,
    lastPlayedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (facultySnap.exists()) {
    const prev = facultySnap.data();
    const prevTotal = Number(prev.totalSessions) || 0;
    const newTotal = prevTotal + 1;

    const prevAcc = Number(prev.metrics?.accuracy) || sessionAccuracy;
    const rollingAccuracy = Math.round((prevAcc * prevTotal + sessionAccuracy) / newTotal);

    const prevLat = Number(prev.metrics?.averageLatency) || sessionLatency;
    const rollingLatency = Math.round((prevLat * prevTotal + sessionLatency) / newTotal);

    const bestScore = Math.max(Number(prev.metrics?.bestScore) || 0, sessionScore);
    const peakSpan = Math.max(Number(prev.metrics?.peakSpan) || 3, sessionSpan);

    // Dynamic level progression (every 5 successful sessions with >= 80% accuracy)
    const currentLevel = Number(prev.level) || 1;
    const nextLevel = rollingAccuracy >= 80 && newTotal >= currentLevel * 4 ? Math.min(5, currentLevel + 1) : currentLevel;

    facultyData = {
      ...prev,
      level: nextLevel,
      metrics: {
        score: sessionScore,
        accuracy: rollingAccuracy,
        averageLatency: rollingLatency,
        bestScore,
        peakSpan,
      },
      totalSessions: newTotal,
      lastPlayedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  }

  await setDoc(facultyRef, facultyData);

  // 3. Update User Document Aggregates: users/{uid}
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  const currentUserData = userSnap.exists() ? userSnap.data() : {};
  const currentStats = currentUserData.stats || {};

  const prevDrills = Number(currentStats.totalDrills) || 0;
  const newTotalDrills = prevDrills + 1;

  // Calculate calendar-day streak
  const streakResult = updateStreakOnSessionComplete({
    currentStreak: Number(currentStats.currentStreak) || 0,
    bestStreak: Number(currentStats.bestStreak) || 0,
    lastTrainingDate: currentStats.lastTrainingDate || null,
  });

  const prevAcc = Number(currentStats.averageAccuracy) || sessionAccuracy;
  const newAverageAccuracy = Math.round((prevAcc * prevDrills + sessionAccuracy) / newTotalDrills);

  const prevLat = Number(currentStats.averageLatencyMs) || sessionLatency;
  const newAverageLatency = Math.round((prevLat * prevDrills + sessionLatency) / newTotalDrills);

  const newPeakSpan = Math.max(Number(currentStats.peakSpan) || 3, sessionSpan);

  // Calculate Cognitive Index and Readiness
  const newCognitiveIndex = calculateCognitiveIndex({
    averageAccuracy: newAverageAccuracy,
    averageLatencyMs: newAverageLatency,
    maxSpan: newPeakSpan,
    totalSessions: newTotalDrills,
  });

  const newReadiness = calculateCognitiveReadiness({
    recentAccuracy: sessionAccuracy,
    streak: streakResult.currentStreak,
    totalSessions: newTotalDrills,
  });

  const updatedStats = {
    ...currentStats,
    totalDrills: newTotalDrills,
    currentStreak: streakResult.currentStreak,
    bestStreak: streakResult.bestStreak,
    lastTrainingDate: streakResult.lastTrainingDate,
    averageAccuracy: newAverageAccuracy,
    averageLatencyMs: newAverageLatency,
    peakSpan: newPeakSpan,
    cognitiveIndex: newCognitiveIndex,
    readiness: newReadiness,
  };

  await updateUserProfile(uid, { stats: updatedStats });

  return {
    facultyData,
    stats: updatedStats,
  };
}

/**
 * Retrieves all faculty progress documents for a given user.
 *
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Map of facultyId -> facultyData
 */
export async function getUserFaculties(uid) {
  if (!uid) return {};

  try {
    const facultiesCol = collection(db, 'users', uid, 'faculties');
    const querySnapshot = await getDocs(facultiesCol);

    const facultiesMap = {};
    querySnapshot.forEach((docSnap) => {
      facultiesMap[docSnap.id] = docSnap.data();
    });
    return facultiesMap;
  } catch (e) {
    console.warn('Failed to retrieve faculty documents from Firestore:', e);
    return {};
  }
}

export default {
  recordSessionAndRecalculate,
  getUserFaculties,
};
