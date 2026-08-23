/**
 * OVERLOAD Player Context (Local-First Architecture)
 * Manages local player profile, session hydration, and settings persistence via AsyncStorage.
 * Zero network, authentication, or cloud dependencies.
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import storageService from '../services/storageService';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [playerProfile, setPlayerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refresh current player's profile and stats from local AsyncStorage
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await storageService.getPlayerProfile();
      if (profile) {
        setPlayerProfile(profile);
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
    setPlayerProfile((prev) => {
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

  const value = {
    player: playerProfile ? { id: playerProfile.playerId, displayName: playerProfile.displayName } : null,
    playerProfile,
    userProfile: playerProfile, // Alias for backward compatibility
    loading,
    playerId: playerProfile?.playerId || 'OP-1001',
    updateSettings,
    refreshProfile,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

// Aliases for seamless compatibility
export const useAuth = usePlayer;
export const AuthProvider = PlayerProvider;

export default PlayerContext;
