import { useState, useEffect, useCallback, useRef } from 'react';
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
    console.log('🎮 useGameState hook initialized at', new Date().toISOString());
    isMountedRef.current = true;

    return () => {
      console.log('🎮 useGameState hook cleaning up at', new Date().toISOString());
      isMountedRef.current = false;
      
      // Reset local state on unmount
      setLocalState({
        health: 100,
        ammunition: 50,
        score: 0,
        enemiesDefeated: 0,
        isGameStarted: false,
      });
      
      console.log('✅ Game state reset to initial values');
    };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;

    console.log('🔄 Backend state updated:', backendState);
    console.log('⏳ Backend loading:', isLoading);
    
    if (backendState) {
      console.log('✅ Syncing backend state to local state');
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
    if (!isMountedRef.current) {
      console.log('⏭️ Game state unmounted, skipping initialization');
      return;
    }

    console.log('🎮 initializeGame called', {
      isGameStarted: localState.isGameStarted,
      isLoading,
      timestamp: new Date().toISOString(),
    });
    
    if (!localState.isGameStarted && !isLoading) {
      console.log('🚀 Starting game on backend...');
      try {
        startGame();
        console.log('✅ Backend startGame called successfully');
      } catch (error) {
        console.error('❌ Failed to start game:', error);
      }
    } else {
      console.log('⏭️ Game already started or loading, skipping initialization');
    }
  }, [localState.isGameStarted, isLoading, startGame]);

  const decrementAmmo = useCallback(() => {
    if (!isMountedRef.current) return;
    
    console.log('🔫 Decrementing ammunition');
    setLocalState((prev) => ({
      ...prev,
      ammunition: Math.max(0, prev.ammunition - 1),
    }));
  }, []);

  const handleEnemyDefeat = useCallback(() => {
    if (!isMountedRef.current) return;
    
    console.log('💀 Handling enemy defeat at', new Date().toISOString());
    try {
      defeatEnemy();
      increaseScore(BigInt(100));
      setLocalState((prev) => ({
        ...prev,
        score: prev.score + 100,
        enemiesDefeated: prev.enemiesDefeated + 1,
      }));
      console.log('✅ Enemy defeat processed');
    } catch (error) {
      console.error('❌ Failed to process enemy defeat:', error);
    }
  }, [defeatEnemy, increaseScore]);

  const handleTakeDamage = useCallback(
    (amount: number) => {
      if (!isMountedRef.current) return;
      
      console.log('💔 Taking damage:', amount, 'at', new Date().toISOString());
      try {
        takeDamage(BigInt(amount));
        setLocalState((prev) => ({
          ...prev,
          health: Math.max(0, prev.health - amount),
        }));
        console.log('✅ Damage processed');
      } catch (error) {
        console.error('❌ Failed to process damage:', error);
      }
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
