import { useState, useEffect, useRef, useCallback } from 'react';

export type InitStage = 'idle' | 'canvas' | 'physics' | 'arena' | 'player' | 'enemies' | 'complete' | 'error';

export interface GameInitializationState {
  isInitializing: boolean;
  isComplete: boolean;
  isError: boolean;
  currentStage: InitStage;
  progress: number;
  errorMessage: string | null;
  retryCount: number;
  markStageComplete: (stage: 'canvasReady' | 'physicsReady' | 'arenaReady' | 'playerReady' | 'enemiesReady') => void;
  retry: () => void;
  startInitialization: () => void;
}

const STAGE_PROGRESS: Record<string, number> = {
  idle: 0,
  canvas: 20,
  physics: 40,
  arena: 60,
  player: 80,
  enemies: 95,
  complete: 100,
  error: 0,
};

const MAX_RETRIES = 2;
const STAGE_TIMEOUT_MS = 12000;

export function useGameInitialization(): GameInitializationState {
  const [currentStage, setCurrentStage] = useState<InitStage>('idle');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const stagesCompletedRef = useRef<Set<string>>(new Set());
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const initStartedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    };
  }, []);

  const clearStageTimer = useCallback(() => {
    if (stageTimerRef.current) {
      clearTimeout(stageTimerRef.current);
      stageTimerRef.current = null;
    }
  }, []);

  const failWithError = useCallback((msg: string) => {
    if (!mountedRef.current) return;
    clearStageTimer();
    setCurrentStage('error');
    setIsError(true);
    setIsInitializing(false);
    setErrorMessage(msg);
  }, [clearStageTimer]);

  const advanceToComplete = useCallback(() => {
    if (!mountedRef.current) return;
    clearStageTimer();
    setCurrentStage('complete');
    setIsComplete(true);
    setIsInitializing(false);
  }, [clearStageTimer]);

  const startStageTimer = useCallback((stageName: string, nextAction: () => void) => {
    clearStageTimer();
    stageTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      if (retryCount < MAX_RETRIES) {
        // Will be handled by retry
        failWithError(`Stage "${stageName}" timed out. Please retry.`);
      } else {
        failWithError(`Initialization failed at stage "${stageName}" after ${MAX_RETRIES + 1} attempts.`);
      }
    }, STAGE_TIMEOUT_MS);
    // Call nextAction immediately (it will be overridden by markStageComplete)
    void nextAction;
  }, [clearStageTimer, failWithError, retryCount]);

  const markStageComplete = useCallback((stage: 'canvasReady' | 'physicsReady' | 'arenaReady' | 'playerReady' | 'enemiesReady') => {
    if (!mountedRef.current || !isInitializing) return;
    if (stagesCompletedRef.current.has(stage)) return;

    stagesCompletedRef.current.add(stage);
    clearStageTimer();

    const stageOrder = ['canvasReady', 'physicsReady', 'arenaReady', 'playerReady', 'enemiesReady'];
    const allDone = stageOrder.every(s => stagesCompletedRef.current.has(s));

    if (allDone) {
      advanceToComplete();
      return;
    }

    // Advance to next stage display
    const stageMap: Record<string, InitStage> = {
      canvasReady: 'physics',
      physicsReady: 'arena',
      arenaReady: 'player',
      playerReady: 'enemies',
      enemiesReady: 'complete',
    };
    const nextStage = stageMap[stage];
    if (nextStage) {
      setCurrentStage(nextStage);
      // Set a timeout for the next stage
      stageTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        failWithError(`Stage "${nextStage}" timed out. Please retry.`);
      }, STAGE_TIMEOUT_MS);
    }
  }, [isInitializing, clearStageTimer, advanceToComplete, failWithError]);

  const startInitialization = useCallback(() => {
    if (initStartedRef.current && isInitializing) return;
    if (isComplete) return;

    initStartedRef.current = true;
    stagesCompletedRef.current = new Set();
    clearStageTimer();

    setIsError(false);
    setErrorMessage(null);
    setIsComplete(false);
    setCurrentStage('canvas');
    setIsInitializing(true);

    // Set initial stage timeout
    stageTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      failWithError('Canvas initialization timed out. Please retry.');
    }, STAGE_TIMEOUT_MS);
  }, [isInitializing, isComplete, clearStageTimer, failWithError]);

  const retry = useCallback(() => {
    if (retryCount >= MAX_RETRIES) {
      setErrorMessage(`Maximum retry attempts (${MAX_RETRIES}) reached. Please reload the page.`);
      return;
    }

    initStartedRef.current = false;
    stagesCompletedRef.current = new Set();
    clearStageTimer();

    setRetryCount(prev => prev + 1);
    setIsError(false);
    setErrorMessage(null);
    setIsComplete(false);
    setCurrentStage('idle');
    setIsInitializing(false);
  }, [retryCount, clearStageTimer]);

  const progress = STAGE_PROGRESS[currentStage] ?? 0;

  return {
    isInitializing,
    isComplete,
    isError,
    currentStage,
    progress,
    errorMessage,
    retryCount,
    markStageComplete,
    retry,
    startInitialization,
  };
}
