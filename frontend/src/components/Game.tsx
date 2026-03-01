import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky } from '@react-three/drei';
import Arena from './Arena';
import Player from './Player';
import HUD from './HUD';
import LoadingScreen from './LoadingScreen';
import CanvasErrorFallback from './CanvasErrorFallback';
import { useGameState } from '../hooks/useGameState';
import { useEnemies } from '../hooks/useEnemies';
import { useGameInitialization } from '../hooks/useGameInitialization';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';

function PhysicsScene({
  onPhysicsReady,
  onArenaLoaded,
  onEnemiesSpawned,
  onPlayerReady,
  onEnemyHit,
  onShoot,
  enemies,
  ammunition,
}: {
  onPhysicsReady: () => void;
  onArenaLoaded: () => void;
  onEnemiesSpawned: () => void;
  onPlayerReady: () => void;
  onEnemyHit: (enemyId: string) => void;
  onShoot: () => void;
  enemies: ReturnType<typeof useEnemies>['enemies'];
  ammunition: number;
}) {
  const physicsReadyRef = useRef(false);

  useEffect(() => {
    if (!physicsReadyRef.current) {
      physicsReadyRef.current = true;
      const t = setTimeout(() => onPhysicsReady(), 150);
      return () => clearTimeout(t);
    }
  }, [onPhysicsReady]);

  return (
    <Physics gravity={[0, -9.81, 0]}>
      <Arena
        enemies={enemies}
        onArenaLoaded={onArenaLoaded}
        onEnemiesSpawned={onEnemiesSpawned}
      />
      <Player
        ammunition={ammunition}
        onShoot={onShoot}
        onEnemyHit={onEnemyHit}
        enemies={enemies}
        onSpawned={onPlayerReady}
      />
    </Physics>
  );
}

export default function Game() {
  const gameState = useGameState();
  const { enemies, damageEnemy } = useEnemies();
  const initState = useGameInitialization();
  const [hasStarted, setHasStarted] = useState(false);
  const [canvasError, setCanvasError] = useState<Error | null>(null);
  const canvasReadyRef = useRef(false);
  const audioInitializedRef = useRef(false);

  const aliveEnemies = enemies.filter((e) => !e.isDestroyed).length;

  const { isMuted, toggleMute, currentTrack, initAudio } = useBackgroundMusic({
    gameActive: hasStarted && initState.isComplete,
    hasEnemies: aliveEnemies > 0,
  });

  const handleStart = useCallback(() => {
    setHasStarted(true);
    if (!audioInitializedRef.current) {
      audioInitializedRef.current = true;
      initAudio();
    }
    initState.startInitialization();
  }, [initState, initAudio]);

  // Mark canvas ready via onCreated callback
  const handleCanvasCreated = useCallback(() => {
    if (!canvasReadyRef.current && initState.isInitializing) {
      canvasReadyRef.current = true;
      initState.markStageComplete('canvasReady');
    }
  }, [initState]);

  // Fallback timer to mark canvas ready if onCreated fires before isInitializing is set
  useEffect(() => {
    if (!initState.isInitializing || canvasReadyRef.current) return;
    const t = setTimeout(() => {
      if (!canvasReadyRef.current) {
        canvasReadyRef.current = true;
        initState.markStageComplete('canvasReady');
      }
    }, 600);
    return () => clearTimeout(t);
  }, [initState.isInitializing, initState]);

  const handlePhysicsReady = useCallback(() => {
    initState.markStageComplete('physicsReady');
  }, [initState]);

  const handleArenaLoaded = useCallback(() => {
    initState.markStageComplete('arenaReady');
  }, [initState]);

  const handleEnemiesSpawned = useCallback(() => {
    initState.markStageComplete('enemiesReady');
  }, [initState]);

  const handlePlayerReady = useCallback(() => {
    initState.markStageComplete('playerReady');
    // Initialize game on backend when player spawns
    if (!gameState.isGameStarted && !gameState.isLoading) {
      gameState.initializeGame();
    }
  }, [initState, gameState]);

  const handleShoot = useCallback(() => {
    gameState.decrementAmmo();
  }, [gameState]);

  const handleEnemyHit = useCallback(
    (enemyId: string) => {
      const defeated = damageEnemy(enemyId, 34);
      if (defeated) {
        gameState.handleEnemyDefeat();
      }
    },
    [damageEnemy, gameState]
  );

  const handleCanvasError = useCallback((error: Error) => {
    setCanvasError(error);
  }, []);

  // Show start screen
  if (!hasStarted) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bond-start-screen">
        <div className="bond-title-card">
          <div className="bond-gun-barrel" />
          <h1 className="bond-title">OPERATION: NAKATOMI</h1>
          <p className="bond-subtitle">A First-Person Tactical Experience</p>
          <button className="bond-start-btn" onClick={handleStart}>
            BEGIN MISSION
          </button>
          <p className="bond-hint">Click to engage · WASD to move · Mouse to aim · Click to fire</p>
        </div>
      </div>
    );
  }

  // Show canvas error fallback
  if (canvasError) {
    return (
      <CanvasErrorFallback
        error={canvasError}
        onRetry={() => {
          setCanvasError(null);
          canvasReadyRef.current = false;
          initState.retry();
          setHasStarted(false);
        }}
      />
    );
  }

  // Show permanent error fallback after max retries
  if (initState.isError && initState.retryCount >= 2) {
    return (
      <CanvasErrorFallback
        error={new Error(initState.errorMessage || 'Initialization failed after multiple attempts.')}
        onRetry={() => {
          canvasReadyRef.current = false;
          initState.retry();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Loading overlay — shown until all stages complete */}
      {!initState.isComplete && (
        <LoadingScreen
          progress={initState.progress}
          currentStage={initState.currentStage}
          retryCount={initState.retryCount}
          isError={initState.isError}
          errorMessage={initState.errorMessage}
          onRetry={() => {
            canvasReadyRef.current = false;
            initState.retry();
          }}
        />
      )}

      {/* 3D Canvas — always mounted after start so callbacks can fire */}
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        onCreated={handleCanvasCreated}
        onError={handleCanvasError as never}
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
          <Sky sunPosition={[100, 20, 100]} />
          <PhysicsScene
            onPhysicsReady={handlePhysicsReady}
            onArenaLoaded={handleArenaLoaded}
            onEnemiesSpawned={handleEnemiesSpawned}
            onPlayerReady={handlePlayerReady}
            onEnemyHit={handleEnemyHit}
            onShoot={handleShoot}
            enemies={enemies}
            ammunition={gameState.ammunition}
          />
        </Suspense>
      </Canvas>

      {/* HUD — only shown when initialization is complete */}
      {initState.isComplete && (
        <HUD
          health={gameState.health}
          ammunition={gameState.ammunition}
          score={gameState.score}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          currentTrack={currentTrack}
        />
      )}
    </div>
  );
}
