/**
 * OVERLOAD Firebase Authentication Service
 * User registration, authentication, signout, and state listening
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebaseConfig';
import { createUserDocument } from './userService';

/**
 * Formats Firebase auth errors into clear user-friendly messages.
 */
export function formatAuthError(error) {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = error.code || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/network-request-failed':
      return 'Network connection unavailable. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again in a few moments.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

/**
 * Registers a new user with email, password, and display name.
 * Automatically provisions initial Firestore user document.
 */
export async function signUp({ email, password, displayName = 'Operator' }) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase credentials not configured. Please set environment variables.');
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  const user = userCredential.user;

  // Update display name in Firebase Auth
  if (displayName && user) {
    try {
      await updateProfile(user, { displayName: displayName.trim() });
    } catch (e) {
      console.warn('Profile display name update failed:', e);
    }
  }

  // Provision Firestore user document & initial statistics
  await createUserDocument(user.uid, {
    email: user.email,
    displayName: displayName.trim() || 'Operator',
  });

  return user;
}

/**
 * Authenticates user with email and password.
 */
export async function signIn({ email, password }) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase credentials not configured. Please set environment variables.');
  }

  const userCredential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  return userCredential.user;
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOut() {
  if (auth.currentUser) {
    await firebaseSignOut(auth);
  }
  return true;
}

/**
 * Sends a password reset email.
 */
export async function resetPassword(email) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase credentials not configured. Please set environment variables.');
  }
  await sendPasswordResetEmail(auth, email.trim());
  return true;
}

/**
 * Subscribes to Firebase Auth state changes.
 */
export function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Returns current authenticated user synchronously.
 */
export function getCurrentUser() {
  return auth.currentUser;
}

export default {
  signUp,
  signIn,
  signOut,
  resetPassword,
  onAuthStateChanged,
  getCurrentUser,
  formatAuthError,
};
