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
import '../styles/game-theme.css';

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

const CONTROLS = [
  { keys: ['W', 'A', 'S', 'D'], label: 'Move Forward / Left / Back / Right' },
  { keys: ['MOUSE'], label: 'Aim & Look Around' },
  { keys: ['CLICK'], label: 'Fire Weapon' },
  { keys: ['SPACE'], label: 'Jump' },
  { keys: ['ESC'], label: 'Release Mouse Cursor' },
];

function ControlsPanel() {
  return (
    <div
      style={{
        background: 'oklch(0.06 0.01 85 / 0.92)',
        border: '1px solid oklch(0.78 0.18 85 / 0.25)',
        boxShadow: '0 0 30px oklch(0 0 0 / 0.6), inset 0 1px 0 oklch(0.78 0.18 85 / 0.08)',
        padding: '1.25rem 1.5rem',
        minWidth: 320,
        maxWidth: 420,
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid oklch(0.78 0.18 85 / 0.2)',
          paddingBottom: '0.6rem',
          marginBottom: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            width: 3,
            height: 14,
            background: 'oklch(0.78 0.18 85)',
            boxShadow: '0 0 8px oklch(0.78 0.18 85 / 0.7)',
          }}
        />
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'oklch(0.78 0.18 85 / 0.8)',
          }}
        >
          OPERATIVE CONTROLS
        </span>
      </div>

      {/* Control rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {CONTROLS.map(({ keys, label }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            {/* Key badges */}
            <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
              {keys.map((k) => (
                <span
                  key={k}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: k.length > 3 ? 'auto' : 28,
                    height: 22,
                    padding: k.length > 3 ? '0 8px' : '0 4px',
                    background: 'oklch(0.12 0.02 85)',
                    border: '1px solid oklch(0.78 0.18 85 / 0.45)',
                    boxShadow: '0 2px 0 oklch(0.78 0.18 85 / 0.2), inset 0 1px 0 oklch(0.78 0.18 85 / 0.1)',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: 'oklch(0.78 0.18 85)',
                    textTransform: 'uppercase',
                  }}
                >
                  {k}
                </span>
              ))}
            </div>
            {/* Label */}
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'oklch(0.65 0.05 85 / 0.85)',
                textAlign: 'right',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div
        style={{
          marginTop: '0.9rem',
          paddingTop: '0.6rem',
          borderTop: '1px solid oklch(0.78 0.18 85 / 0.12)',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'oklch(0.78 0.18 85 / 0.35)',
          textAlign: 'center',
        }}
      >
        Pointer lock activates on mission start
      </div>
    </div>
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
      <div
        className="fixed inset-0 flex flex-col items-center justify-center overflow-auto"
        style={{
          background: 'oklch(0.04 0 0)',
          backgroundImage: 'url(/assets/generated/bond-title-bg.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'oklch(0.04 0 0 / 0.82)' }}
        />

        {/* Scan-line overlay */}
        <div className="absolute inset-0 scan-line-overlay" />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none">
          <div className="absolute top-6 left-6 w-12 h-px" style={{ background: 'oklch(0.78 0.18 85 / 0.5)' }} />
          <div className="absolute top-6 left-6 w-px h-12" style={{ background: 'oklch(0.78 0.18 85 / 0.5)' }} />
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none">
          <div className="absolute top-6 right-6 w-12 h-px" style={{ background: 'oklch(0.78 0.18 85 / 0.5)' }} />
          <div className="absolute top-6 right-6 w-px h-12" style={{ background: 'oklch(0.78 0.18 85 / 0.5)' }} />
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none">
          <div className="absolute bottom-6 left-6 w-12 h-px" style={{ background: 'oklch(0.78 0.18 85 / 0.5)' }} />
          <div className="absolute bottom-6 left-6 w-px h-12" style={{ background: 'oklch(0.78 0.18 85 / 0.5)' }} />
        </div>
        <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none">
          <div className="absolute bottom-6 right-6 w-12 h-px" style={{ background: 'oklch(0.78 0.18 85 / 0.5)' }} />
          <div className="absolute bottom-6 right-6 w-px h-12" style={{ background: 'oklch(0.78 0.18 85 / 0.5)' }} />
        </div>

        {/* Main content */}
        <div
          className="relative z-10 flex flex-col items-center gap-6 px-4 py-10"
          style={{ width: '100%', maxWidth: 480 }}
        >
          {/* Gun barrel */}
          <div className="bond-barrel-container">
            <div className="bond-barrel-ring" />
            <div className="bond-barrel-ring-inner" />
            <div className="bond-barrel-center">
              <span
                className="title-reveal"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: 'oklch(0.78 0.18 85)',
                  textShadow: '0 0 12px oklch(0.78 0.18 85 / 0.8)',
                }}
              >
                007
              </span>
            </div>
          </div>

          {/* Title block */}
          <div className="flex flex-col items-center gap-1 text-center">
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '0.6rem',
                letterSpacing: '0.45em',
                textTransform: 'uppercase',
                color: 'oklch(0.78 0.18 85 / 0.5)',
              }}
            >
              CLASSIFIED OPERATION
            </p>
            <h1
              className="title-reveal"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '2rem',
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'oklch(0.78 0.18 85)',
                textShadow: '0 0 24px oklch(0.78 0.18 85 / 0.5)',
                lineHeight: 1.1,
              }}
            >
              OPERATION:<br />NAKATOMI
            </h1>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '0.7rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'oklch(0.55 0.05 85 / 0.7)',
                marginTop: '0.25rem',
              }}
            >
              A First-Person Tactical Experience
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: 1,
              background: 'linear-gradient(90deg, transparent, oklch(0.78 0.18 85 / 0.4), transparent)',
            }}
          />

          {/* Controls panel */}
          <ControlsPanel />

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: 1,
              background: 'linear-gradient(90deg, transparent, oklch(0.78 0.18 85 / 0.4), transparent)',
            }}
          />

          {/* Begin Mission button */}
          <button
            className="btn-bond-primary"
            onClick={handleStart}
            style={{
              padding: '0.85rem 3rem',
              fontSize: '0.8rem',
              letterSpacing: '0.3em',
              cursor: 'pointer',
              width: '100%',
              maxWidth: 280,
            }}
          >
            BEGIN MISSION
          </button>

          {/* Classification footer */}
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '0.55rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'oklch(0.78 0.18 85 / 0.2)',
              textAlign: 'center',
            }}
          >
            TOP SECRET — FOR AUTHORIZED PERSONNEL ONLY
          </p>
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
