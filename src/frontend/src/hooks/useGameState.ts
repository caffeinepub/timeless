import { useCallback, useEffect, useRef, useState } from "react";
import { useGameState as useBackendGameState } from "./useQueries";

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

  const [currentLevel, setCurrentLevel] = useState(1);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const isMountedRef = useRef(true);

  const {
    gameState: backendState,
    isLoading,
    startGame,
    takeDamage,
    defeatEnemy,
    increaseScore,
  } = useBackendGameState(PLAYER_ID);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      setLocalState({
        health: 100,
        ammunition: 50,
        score: 0,
        enemiesDefeated: 0,
        isGameStarted: false,
      });
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: isLoading is intentionally included to re-sync when loading completes
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (backendState) {
      setLocalState({
        health: Number(backendState.health),
        ammunition: Number(backendState.ammunition),
        score: Number(backendState.score),
        enemiesDefeated: Number(backendState.enemiesDefeated),
        isGameStarted: true,
      });
    }
  }, [backendState, isLoading]);

  const initializeGame = useCallback(() => {
    if (!isMountedRef.current) return;
    if (!localState.isGameStarted && !isLoading) {
      try {
        startGame();
      } catch (error) {
        console.error("Failed to start game:", error);
      }
    }
  }, [localState.isGameStarted, isLoading, startGame]);

  const decrementAmmo = useCallback(() => {
    if (!isMountedRef.current) return;
    setLocalState((prev) => ({
      ...prev,
      ammunition: Math.max(0, prev.ammunition - 1),
    }));
  }, []);

  const handleEnemyDefeat = useCallback(() => {
    if (!isMountedRef.current) return;
    try {
      defeatEnemy();
      increaseScore(BigInt(100));
      setLocalState((prev) => ({
        ...prev,
        score: prev.score + 100,
        enemiesDefeated: prev.enemiesDefeated + 1,
      }));
    } catch (error) {
      console.error("Failed to process enemy defeat:", error);
    }
  }, [defeatEnemy, increaseScore]);

  const handleTakeDamage = useCallback(
    (amount: number) => {
      if (!isMountedRef.current) return;
      try {
        takeDamage(BigInt(amount));
        setLocalState((prev) => ({
          ...prev,
          health: Math.max(0, prev.health - amount),
        }));
      } catch (error) {
        console.error("Failed to process damage:", error);
      }
    },
    [takeDamage],
  );

  const completedLevel = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsLevelComplete(true);
  }, []);

  const advanceLevel = useCallback(() => {
    if (!isMountedRef.current) return;
    setCurrentLevel((prev) => {
      if (prev >= 10) {
        setIsGameComplete(true);
        setIsLevelComplete(false);
        return prev;
      }
      setIsLevelComplete(false);
      return prev + 1;
    });
  }, []);

  const resetLevel = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsLevelComplete(false);
  }, []);

  return {
    ...localState,
    initializeGame,
    decrementAmmo,
    handleEnemyDefeat,
    handleTakeDamage,
    isLoading,
    currentLevel,
    isLevelComplete,
    isGameComplete,
    completedLevel,
    advanceLevel,
    resetLevel,
  };
}
