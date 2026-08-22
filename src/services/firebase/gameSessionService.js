/**
 * OVERLOAD Game Session Storage Service
 * Records individual drill sessions in Firestore under users/{uid}/gameSessions/{sessionId}
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Generates a unique session document ID.
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Saves a completed game drill session to Firestore.
 *
 * @param {string} uid - User ID
 * @param {Object} sessionData - Completed session metrics
 * @returns {Promise<Object>} Persisted session record
 */
export async function saveGameSession(uid, sessionData) {
  if (!uid) {
    throw new Error('User ID required to persist game session.');
  }

  const sessionId = generateSessionId();
  const sessionRef = doc(db, 'users', uid, 'gameSessions', sessionId);

  const score = Number(sessionData.score) || 0;
  const accuracy = Number(sessionData.accuracy) || 0;
  const latency = Number(sessionData.latency || sessionData.responseTime) || 0;
  const span = Number(sessionData.span) || 3;
  const streak = Number(sessionData.streak) || 0;

  const sessionRecord = {
    sessionId,
    gameType: sessionData.gameType || 'memory-span',
    category: sessionData.category || 'working-memory',
    facultyId: sessionData.facultyId || 'memory',
    modeId: sessionData.modeId || 'sequence_recall',

    score,
    accuracy,
    span,
    streak,
    responseTime: latency,
    latency,
    totalRounds: Number(sessionData.totalRounds) || 1,

    difficulty: sessionData.difficulty || 'adaptive',
    result: sessionData.result || (accuracy >= 80 ? 'success' : 'completed'),

    completedAt: serverTimestamp(),
    completedAtLocal: new Date().toISOString(),

    metadata: {
      span,
      durationSeconds: Number(sessionData.durationSeconds) || 0,
      isPerfect: Boolean(sessionData.isPerfect || accuracy === 100),
    },
  };

  await setDoc(sessionRef, sessionRecord);
  return sessionRecord;
}

/**
 * Retrieves the user's completed game sessions from Firestore.
 *
 * @param {string} uid - User ID
 * @param {number} maxCount - Max count of records to fetch
 * @returns {Promise<Array>} List of session objects sorted descending by completedAt
 */
export async function getGameSessions(uid, maxCount = 50) {
  if (!uid) return [];

  try {
    const sessionsCol = collection(db, 'users', uid, 'gameSessions');
    const q = query(sessionsCol, orderBy('completedAt', 'desc'), limit(maxCount));
    const querySnapshot = await getDocs(q);

    const sessions = [];
    querySnapshot.forEach((docSnap) => {
      sessions.push({ id: docSnap.id, ...docSnap.data() });
    });
    return sessions;
  } catch (e) {
    console.warn('Failed to retrieve game sessions from Firestore:', e);
    return [];
  }
}

export const getUserRecentSessions = getGameSessions;

export default {
  saveGameSession,
  getGameSessions,
  getUserRecentSessions,
};
