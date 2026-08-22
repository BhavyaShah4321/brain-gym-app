/**
 * OVERLOAD Firebase Configuration & Initialization Layer
 *
 * Singleton initialization supporting React Native Fast Refresh,
 * AsyncStorage auth persistence, and graceful fallback handling.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Read configuration from Expo public environment variables
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'overload-app-dev',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

/**
 * Validates if functional Firebase credentials have been configured.
 */
export function isFirebaseConfigured() {
  return (
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    Boolean(firebaseConfig.projectId) &&
    firebaseConfig.projectId !== 'your_project_id'
  );
}

// 1. Initialize Firebase App (Safe Singleton)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// 2. Initialize Firebase Auth with React Native AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // If already initialized (e.g. during Fast Refresh / hot reload), retrieve existing auth instance
  auth = getAuth(app);
}

// 3. Initialize Cloud Firestore
const db = getFirestore(app);

export { app, auth, db };
export default {
  app,
  auth,
  db,
  firebaseConfig,
  isFirebaseConfigured,
};
