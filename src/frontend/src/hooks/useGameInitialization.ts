import { useState, useEffect, useCallback } from 'react';

interface GameInitializationState {
  isInitialized: boolean;
  isInitializing: boolean;
  retryCount: number;
  maxRetries: number;
  error: Error | null;
  shouldRetry: boolean;
}

export function useGameInitialization(dependenciesReady: boolean) {
  const [state, setState] = useState<GameInitializationState>({
    isInitialized: false,
    isInitializing: false,
    retryCount: 0,
    maxRetries: 3,
    error: null,
    shouldRetry: false,
  });

  const reset = useCallback(() => {
    console.log('🔄 Resetting game initialization state');
    setState({
      isInitialized: false,
      isInitializing: false,
      retryCount: 0,
      maxRetries: 3,
      error: null,
      shouldRetry: false,
    });
  }, []);

  const markInitialized = useCallback(() => {
    console.log('✅ Game initialization successful');
    setState((prev) => ({
      ...prev,
      isInitialized: true,
      isInitializing: false,
      error: null,
    }));
  }, []);

  const markFailed = useCallback((error: Error) => {
    console.error('❌ Game initialization failed:', error);
    setState((prev) => {
      const newRetryCount = prev.retryCount + 1;
      const shouldRetry = newRetryCount < prev.maxRetries;

      console.log(`🔄 Retry ${newRetryCount}/${prev.maxRetries}`, shouldRetry ? '(will retry)' : '(max retries reached)');

      return {
        ...prev,
        isInitialized: false,
        isInitializing: false,
        retryCount: newRetryCount,
        error,
        shouldRetry,
      };
    });
  }, []);

  useEffect(() => {
    if (!dependenciesReady) {
      console.log('⏳ Waiting for dependencies to be ready');
      return;
    }

    if (state.isInitialized || state.isInitializing) {
      return;
    }

    if (state.retryCount >= state.maxRetries) {
      console.log('🛑 Max retries reached, not attempting initialization');
      return;
    }

    console.log(`🚀 Attempting game initialization (attempt ${state.retryCount + 1}/${state.maxRetries})`);
    setState((prev) => ({ ...prev, isInitializing: true }));

    // Simulate initialization delay
    const timer = setTimeout(() => {
      markInitialized();
    }, 500);

    return () => clearTimeout(timer);
  }, [dependenciesReady, state.isInitialized, state.isInitializing, state.retryCount, state.maxRetries, markInitialized]);

  return {
    ...state,
    reset,
    markInitialized,
    markFailed,
  };
}
