/**
 * OVERLOAD Local-First Storage Service
 * Manages persistent local player identity, game sessions, statistics, and settings via AsyncStorage.
 * Zero network/Firebase dependency for local gameplay.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateStreakOnSessionComplete } from '../utils/performance/streakCalculator';
import {
  calculateCognitiveIndex,
  calculateCognitiveReadiness,
} from '../utils/performance/cognitiveIndex';

// Storage Keys
const STORAGE_KEYS = {
  PLAYER_ID: '@overload/player_id',
  PLAYER_PROFILE: '@overload/player_profile',
  GAME_SESSIONS: '@overload/game_sessions',
  PLAYER_STATS: '@overload/player_stats',
  FACULTIES: '@overload/faculties',
  SETTINGS: '@overload/settings',
};

// Default Settings
export const DEFAULT_SETTINGS = {
  haptics: true,
  sound: true,
  difficulty: 'adaptive',
  notifications: true,
};

// Default Initial Stats
export const DEFAULT_STATS = {
  totalDrills: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastTrainingDate: null,
  averageAccuracy: 0,
  averageLatencyMs: 0,
  peakSpan: 3,
  cognitiveIndex: 0,
  readiness: 0,
};

/**
 * Generates a persistent local operator identifier, e.g. "OP-8492"
 */
function generateOperatorId() {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `OP-${randNum}`;
}

/**
 * Retrieves or generates the persistent local player ID.
 */
export async function getPlayerId() {
  try {
    let playerId = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_ID);
    if (!playerId) {
      playerId = generateOperatorId();
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_ID, playerId);
    }
    return playerId;
  } catch (e) {
    console.warn('Failed to read playerId from AsyncStorage:', e);
    return 'OP-1001';
  }
}

/**
 * Retrieves the full local player profile.
 */
export async function getPlayerProfile() {
  try {
    const playerId = await getPlayerId();
    const stats = await getPlayerStats();
    const settings = await getSettings();

    const storedProfileStr = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_PROFILE);
    const storedProfile = storedProfileStr ? JSON.parse(storedProfileStr) : {};

    return {
      uid: playerId,
      playerId,
      displayName: storedProfile.displayName || 'Operator',
      email: '',
      profile: {
        level: Math.max(1, Math.floor((stats.totalDrills || 0) / 5) + 1),
        operatorId: playerId,
        avatar: null,
        accountStatus: 'local',
      },
      stats,
      settings,
    };
  } catch (e) {
    console.warn('Failed to get player profile:', e);
    return {
      uid: 'OP-1001',
      playerId: 'OP-1001',
      displayName: 'Operator',
      email: '',
      profile: { level: 1, operatorId: 'OP-1001', accountStatus: 'local' },
      stats: DEFAULT_STATS,
      settings: DEFAULT_SETTINGS,
    };
  }
}

/**
 * Retrieves all stored game sessions (newest first).
 */
export async function getGameSessions(limitCount = 100) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.GAME_SESSIONS);
    if (!raw) return [];
    const sessions = JSON.parse(raw);
    if (!Array.isArray(sessions)) return [];
    return sessions.slice(0, limitCount);
  } catch (e) {
    console.warn('Failed to read game sessions from AsyncStorage:', e);
    return [];
  }
}

/**
 * Saves a completed game drill session to AsyncStorage and updates aggregated stats.
 *
 * @param {Object} sessionData - Completed session metrics
 * @returns {Promise<Object>} { session, updatedStats, facultyData }
 */
export async function saveGameSession(sessionData) {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const score = Number(sessionData.score) || 0;
    const accuracy = Number(sessionData.accuracy) || 0;
    const latency = Number(sessionData.latency || sessionData.responseTime) || 0;
    const span = Number(sessionData.span) || 3;
    const facultyId = sessionData.facultyId || 'memory';

    const newSession = {
      id: sessionId,
      sessionId,
      gameType: sessionData.gameType || 'memory-span',
      category: sessionData.category || 'working-memory',
      facultyId,
      modeId: sessionData.modeId || 'sequence_recall',

      score,
      accuracy,
      span,
      streak: Number(sessionData.streak) || 0,
      responseTime: latency,
      latency,
      totalRounds: Number(sessionData.totalRounds) || 1,

      difficulty: sessionData.difficulty || 'adaptive',
      result: sessionData.result || (accuracy >= 80 ? 'success' : 'completed'),

      completedAt: nowIso,
      completedAtLocal: nowIso,

      metadata: {
        span,
        durationSeconds: Number(sessionData.durationSeconds) || 0,
        isPerfect: Boolean(sessionData.isPerfect || accuracy === 100),
      },
    };

    // 1. Prepend to session history
    const existingSessions = await getGameSessions(500);
    const updatedSessions = [newSession, ...existingSessions];
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(updatedSessions));

    // 2. Update aggregated statistics
    const currentStats = await getPlayerStats();
    const newTotalDrills = (currentStats.totalDrills || 0) + 1;

    // Calculate calendar-day streak
    const streakResult = updateStreakOnSessionComplete({
      currentStreak: currentStats.currentStreak || 0,
      bestStreak: currentStats.bestStreak || 0,
      lastTrainingDate: currentStats.lastTrainingDate || null,
    });

    const prevAcc = currentStats.averageAccuracy || accuracy;
    const newAverageAccuracy = Math.round(
      ((prevAcc * (newTotalDrills - 1)) + accuracy) / newTotalDrills
    );

    const prevLat = currentStats.averageLatencyMs || latency;
    const newAverageLatency = Math.round(
      ((prevLat * (newTotalDrills - 1)) + latency) / newTotalDrills
    );

    const newPeakSpan = Math.max(currentStats.peakSpan || 3, span);

    // Calculate Cognitive Index and Readiness
    const newCognitiveIndex = calculateCognitiveIndex({
      averageAccuracy: newAverageAccuracy,
      averageLatencyMs: newAverageLatency,
      maxSpan: newPeakSpan,
      totalSessions: newTotalDrills,
    });

    const newReadiness = calculateCognitiveReadiness({
      recentAccuracy: accuracy,
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

    await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(updatedStats));

    // 3. Update faculty progress
    const facultiesMap = await getAllFaculties();
    const prevFaculty = facultiesMap[facultyId] || {};
    const prevFacTotal = prevFaculty.totalSessions || 0;
    const newFacTotal = prevFacTotal + 1;

    const prevFacAcc = prevFaculty.metrics?.accuracy || accuracy;
    const rollingFacAcc = Math.round(((prevFacAcc * prevFacTotal) + accuracy) / newFacTotal);

    const prevFacLat = prevFaculty.metrics?.averageLatency || latency;
    const rollingFacLat = Math.round(((prevFacLat * prevFacTotal) + latency) / newFacTotal);

    const bestScore = Math.max(prevFaculty.metrics?.bestScore || 0, score);
    const peakSpan = Math.max(prevFaculty.metrics?.peakSpan || 3, span);
    const currentLevel = prevFaculty.level || 1;
    const nextLevel = rollingFacAcc >= 80 && newFacTotal >= currentLevel * 4 ? Math.min(5, currentLevel + 1) : currentLevel;

    const facultyData = {
      facultyId,
      level: nextLevel,
      metrics: {
        score,
        accuracy: rollingFacAcc,
        averageLatency: rollingFacLat,
        bestScore,
        peakSpan,
      },
      totalSessions: newFacTotal,
      lastPlayedAt: nowIso,
      updatedAt: nowIso,
    };

    facultiesMap[facultyId] = facultyData;
    await AsyncStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(facultiesMap));

    return {
      session: newSession,
      updatedStats,
      facultyData,
    };
  } catch (e) {
    console.warn('Failed to save game session locally:', e);
    return null;
  }
}

/**
 * Retrieves player aggregated statistics.
 */
export async function getPlayerStats() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to read player stats from AsyncStorage:', e);
    return { ...DEFAULT_STATS };
  }
}

/**
 * Retrieves all faculty progress records.
 */
export async function getAllFaculties() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.FACULTIES);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (e) {
    console.warn('Failed to read faculties from AsyncStorage:', e);
    return {};
  }
}

/**
 * Retrieves user settings from AsyncStorage.
 */
export async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to read settings from AsyncStorage:', e);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Updates user settings in AsyncStorage.
 */
export async function saveSettings(newSettings) {
  try {
    const current = await getSettings();
    const updated = { ...current, ...newSettings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save settings to AsyncStorage:', e);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Resets local data (for testing/clearing if needed).
 */
export async function clearAllLocalData() {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PLAYER_ID,
      STORAGE_KEYS.PLAYER_PROFILE,
      STORAGE_KEYS.GAME_SESSIONS,
      STORAGE_KEYS.PLAYER_STATS,
      STORAGE_KEYS.FACULTIES,
      STORAGE_KEYS.SETTINGS,
    ]);
  } catch (e) {
    console.warn('Failed to clear local data:', e);
  }
}

export default {
  getPlayerId,
  getPlayerProfile,
  getGameSessions,
  saveGameSession,
  getPlayerStats,
  getAllFaculties,
  getSettings,
  saveSettings,
  clearAllLocalData,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
};
