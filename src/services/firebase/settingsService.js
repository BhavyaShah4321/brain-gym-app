/**
 * OVERLOAD User Settings Service
 * Persistence and retrieval of haptic, sound, and difficulty configurations
 */

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const DEFAULT_SETTINGS = {
  haptics: true,
  sound: true,
  difficulty: 'adaptive',
  notifications: true,
};

/**
 * Retrieves settings for a given user.
 *
 * @param {string} uid
 * @returns {Promise<Object>}
 */
export async function getUserSettings(uid) {
  if (!uid) return DEFAULT_SETTINGS;

  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists() && docSnap.data().settings) {
      return {
        ...DEFAULT_SETTINGS,
        ...docSnap.data().settings,
      };
    }
  } catch (e) {
    console.warn('Failed to retrieve user settings from Firestore:', e);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Updates user settings in Firestore.
 *
 * @param {string} uid
 * @param {Object} newSettings - Partial or complete settings object
 * @returns {Promise<boolean>}
 */
export async function updateUserSettings(uid, newSettings) {
  if (!uid || !newSettings) return false;

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      settings: newSettings,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.warn('Failed to persist user settings to Firestore:', e);
    return false;
  }
}

export default {
  DEFAULT_SETTINGS,
  getUserSettings,
  updateUserSettings,
};
