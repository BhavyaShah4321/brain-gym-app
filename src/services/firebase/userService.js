/**
 * OVERLOAD Firestore User Profile Service
 * User document management, profile retrieval, and updates
 */

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Generates an operator identifier string, e.g. "OP-8492"
 */
export function generateOperatorId() {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `OP-${randNum}`;
}

/**
 * Creates initial user profile document in Firestore upon registration.
 *
 * @param {string} uid - Firebase user ID
 * @param {Object} userData - Registration parameters
 * @returns {Promise<Object>} Created user document data
 */
export async function createUserDocument(uid, { email, displayName = 'Operator' }) {
  const userRef = doc(db, 'users', uid);

  // Check if document already exists
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }

  const initialUserData = {
    uid,
    email: email || '',
    displayName: displayName || 'Operator',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    profile: {
      level: 1,
      operatorId: generateOperatorId(),
      avatar: null,
      accountStatus: 'active',
    },

    stats: {
      cognitiveIndex: 0,
      readiness: 0,
      totalDrills: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastTrainingDate: null,
      averageAccuracy: 0,
      averageLatencyMs: 0,
      peakSpan: 3,
    },

    settings: {
      haptics: true,
      sound: true,
      difficulty: 'adaptive',
      notifications: true,
    },
  };

  await setDoc(userRef, initialUserData, { merge: true });
  return initialUserData;
}

/**
 * Retrieves the user profile document from Firestore.
 *
 * @param {string} uid - Firebase user ID
 * @returns {Promise<Object|null>} User document data or null if not found
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

/**
 * Updates partial fields on a user's document using merge semantics.
 *
 * @param {string} uid - Firebase user ID
 * @param {Object} updates - Fields to update
 */
export async function updateUserProfile(uid, updates) {
  if (!uid || !updates) return;
  const userRef = doc(db, 'users', uid);
  await setDoc(
    userRef,
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export default {
  createUserDocument,
  getUserProfile,
  updateUserProfile,
  generateOperatorId,
};
