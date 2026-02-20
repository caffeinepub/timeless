import { useState, useEffect, useCallback } from 'react';
import { useGameState as useBackendGameState } from './useQueries';

export interface LocalGameState {
  health: number;
  ammunition: number;
  score: number;
  enemiesDefeated: number;
  isGameStarted: boolean;
}

const PLAYER_ID = BigInt(1);

export function useGameState() {
  const [localState, setLocalState] = useState<LocalGameState>({
    health: 100,
    ammunition: 50,
    score: 0,
    enemiesDefeated: 0,
    isGameStarted: false,
  });

  const {
    gameState: backendState,
    isLoading,
    startGame,
    takeDamage,
    defeatEnemy,
    increaseScore,
  } = useBackendGameState(PLAYER_ID);

  useEffect(() => {
    if (backendState) {
      setLocalState({
        health: Number(backendState.health),
        ammunition: Number(backendState.ammunition),
        score: Number(backendState.score),
        enemiesDefeated: Number(backendState.enemiesDefeated),
        isGameStarted: true,
      });
    }
  }, [backendState]);

  const initializeGame = useCallback(() => {
    if (!localState.isGameStarted && !isLoading) {
      startGame();
    }
  }, [localState.isGameStarted, isLoading, startGame]);

  const decrementAmmo = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      ammunition: Math.max(0, prev.ammunition - 1),
    }));
  }, []);

  const handleEnemyDefeat = useCallback(() => {
    defeatEnemy();
    increaseScore(BigInt(100));
    setLocalState((prev) => ({
      ...prev,
      score: prev.score + 100,
      enemiesDefeated: prev.enemiesDefeated + 1,
    }));
  }, [defeatEnemy, increaseScore]);

  const handleTakeDamage = useCallback(
    (amount: number) => {
      takeDamage(BigInt(amount));
      setLocalState((prev) => ({
        ...prev,
        health: Math.max(0, prev.health - amount),
      }));
    },
    [takeDamage]
  );

  return {
    ...localState,
    initializeGame,
    decrementAmmo,
    handleEnemyDefeat,
    handleTakeDamage,
    isLoading,
  };
}
