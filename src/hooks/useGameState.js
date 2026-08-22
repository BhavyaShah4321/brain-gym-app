/**
 * OVERLOAD useGameState Hook
 * Manages reactive game round state and user interaction cycles
 */

import { useState, useCallback } from 'react';

export function useGameState(initialState = {}) {
  const [gameState, setGameState] = useState(initialState);

  const updateGameState = useCallback((updates) => {
    setGameState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetGameState = useCallback(() => {
    setGameState(initialState);
  }, [initialState]);

  return {
    gameState,
    updateGameState,
    resetGameState,
  };
}

export default useGameState;
