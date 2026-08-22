/**
 * OVERLOAD Central State Context (Local-First Architecture)
 * Manages local player profile, session hydration, and settings persistence via AsyncStorage.
 * No mandatory Firebase login required.
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import storageService from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refresh current player's profile and stats from local AsyncStorage
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await storageService.getPlayerProfile();
      if (profile) {
        setUserProfile(profile);
      }
      return profile;
    } catch (e) {
      console.warn('Failed to refresh local player profile:', e);
      return null;
    }
  }, []);

  // Initialize local profile immediately on app startup
  useEffect(() => {
    refreshProfile().finally(() => {
      setLoading(false);
    });
  }, [refreshProfile]);

  // Update Settings with immediate local state update and AsyncStorage sync
  const updateSettings = async (newSettings) => {
    if (!newSettings) return;

    // Optimistic local state update
    setUserProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: {
          ...(prev.settings || {}),
          ...newSettings,
        },
      };
    });

    await storageService.saveSettings(newSettings);
  };

  // Optional future auth helpers (non-blocking)
  const signIn = async () => true;
  const signUp = async () => true;
  const signOut = async () => {
    await refreshProfile();
  };
  const continueAsGuest = () => {
    refreshProfile();
  };
  const resetPassword = async () => true;

  const value = {
    user: userProfile ? { uid: userProfile.playerId, displayName: userProfile.displayName } : null,
    userProfile,
    loading,
    isAuthenticated: true, // Always ready for local gameplay
    isGuest: true,
    playerId: userProfile?.playerId || 'OP-1001',
    signIn,
    signUp,
    signOut,
    continueAsGuest,
    updateSettings,
    refreshProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
