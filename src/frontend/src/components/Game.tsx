import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { Suspense, useEffect, useState, useRef } from 'react';
import Player from './Player';
import Arena from './Arena';
import HUD from './HUD';
import LoadingScreen from './LoadingScreen';
import CanvasErrorFallback from './CanvasErrorFallback';
import { useGameState } from '../hooks/useGameState';
import { useEnemies } from '../hooks/useEnemies';
import { useDependencyCheck } from '../hooks/useDependencyCheck';
import { useGameInitialization } from '../hooks/useGameInitialization';
import { Button } from '@/components/ui/button';

export default function Game() {
  const [isLocked, setIsLocked] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [canvasKey, setCanvasKey] = useState(0);
  const [canvasError, setCanvasError] = useState<Error | null>(null);
  const gameState = useGameState();
  const { enemies, damageEnemy } = useEnemies();
  const pointerLockControlsRef = useRef<any>(null);

  // Check dependencies
  const dependencyCheck = useDependencyCheck();

  // Initialize game with retry logic
  const gameInit = useGameInitialization(dependencyCheck.isReady);

  useEffect(() => {
    console.log('🎮 Game component mounted at', new Date().toISOString());
    console.log('📊 Initial game state:', {
      health: gameState.health,
      ammunition: gameState.ammunition,
      score: gameState.score,
      isGameStarted: gameState.isGameStarted,
    });
    console.log('👾 Enemies loaded:', enemies.length);

    return () => {
      console.log('🎮 Game component unmounting at', new Date().toISOString());
      console.log('🧹 Cleaning up Game component resources');
      
      // Release pointer lock if active
      if (document.pointerLockElement) {
        document.exitPointerLock();
        console.log('🔓 Pointer lock released on unmount');
      }
      
      console.log('✅ Game component cleanup complete');
    };
  }, []);

  useEffect(() => {
    console.log('🔍 Dependency check status:', dependencyCheck);
  }, [dependencyCheck]);

  useEffect(() => {
    console.log('🚀 Game initialization status:', gameInit);
  }, [gameInit]);

  useEffect(() => {
    console.log('🔒 Pointer lock state changed:', isLocked);
    if (isLocked && !gameState.isGameStarted) {
      console.log('🚀 Initializing game...');
      try {
        gameState.initializeGame();
        console.log('✅ Game initialization triggered');
      } catch (error) {
        console.error('❌ Game initialization failed:', error);
        if (error instanceof Error) {
          gameInit.markFailed(error);
        }
      }
    }
  }, [isLocked, gameState.isGameStarted]);

  useEffect(() => {
    console.log('📊 Game state updated:', {
      health: gameState.health,
      ammunition: gameState.ammunition,
      score: gameState.score,
      enemiesDefeated: gameState.enemiesDefeated,
      isGameStarted: gameState.isGameStarted,
      isLoading: gameState.isLoading,
    });
  }, [gameState.health, gameState.ammunition, gameState.score, gameState.enemiesDefeated, gameState.isGameStarted, gameState.isLoading]);

  useEffect(() => {
    console.log('👾 Enemies state updated:', {
      total: enemies.length,
      alive: enemies.filter((e) => !e.isDestroyed).length,
      destroyed: enemies.filter((e) => e.isDestroyed).length,
    });
  }, [enemies]);

  // Auto-retry on failure
  useEffect(() => {
    if (gameInit.shouldRetry && gameInit.error) {
      console.log('🔄 Auto-retry triggered after error');
      const timer = setTimeout(() => {
        console.log('🔄 Resetting canvas for retry');
        setCanvasKey((prev) => prev + 1);
        setCanvasError(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [gameInit.shouldRetry, gameInit.error]);

  const handleEnemyHit = (enemyId: string) => {
    console.log('🎯 Enemy hit:', enemyId);
    try {
      const defeated = damageEnemy(enemyId, 34);
      if (defeated) {
        console.log('💀 Enemy defeated:', enemyId);
        gameState.handleEnemyDefeat();
      }
    } catch (error) {
      console.error('❌ Error handling enemy hit:', error);
    }
  };

  const handleStartClick = () => {
    console.log('▶️ Start button clicked');
    setShowInstructions(false);
  };

  const handleLock = () => {
    console.log('🔒 Pointer locked at', new Date().toISOString());
    setIsLocked(true);
  };

  const handleUnlock = () => {
    console.log('🔓 Pointer unlocked at', new Date().toISOString());
    setIsLocked(false);
  };

  const handleCanvasError = (error: any) => {
    console.error('❌ Canvas error caught:', error);
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('❌ Error message:', errorObj.message);
    console.error('❌ Error stack:', errorObj.stack);
    setCanvasError(errorObj);
    gameInit.markFailed(errorObj);
  };

  const handleRetry = () => {
    console.log('🔄 Manual retry triggered');
    setCanvasKey((prev) => prev + 1);
    setCanvasError(null);
    gameInit.reset();
  };

  // Show loading while checking dependencies
  if (dependencyCheck.isLoading) {
    return <LoadingScreen message="Checking system compatibility..." />;
  }

  // Show error if dependencies failed
  if (dependencyCheck.error) {
    console.error('❌ Dependency check failed:', dependencyCheck.error);
    return <CanvasErrorFallback error={dependencyCheck.error} showRetry={false} />;
  }

  // Show loading while initializing
  if (gameInit.isInitializing) {
    return (
      <LoadingScreen
        message="Initializing 3D scene..."
        retryAttempt={gameInit.retryCount + 1}
        maxRetries={gameInit.maxRetries}
      />
    );
  }

  // Show error if max retries reached
  if (gameInit.retryCount >= gameInit.maxRetries && gameInit.error) {
    console.error('❌ Max retries reached, showing permanent error');
    return (
      <CanvasErrorFallback
        error={gameInit.error.message}
        onRetry={handleRetry}
        showRetry={true}
      />
    );
  }

  // Show canvas error fallback
  if (canvasError && !gameInit.shouldRetry) {
    return (
      <CanvasErrorFallback
        error={canvasError.message}
        onRetry={handleRetry}
        showRetry={gameInit.retryCount < gameInit.maxRetries}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      {gameInit.shouldRetry && (
        <LoadingScreen
          message="Retrying initialization..."
          retryAttempt={gameInit.retryCount + 1}
          maxRetries={gameInit.maxRetries}
        />
      )}

      {showInstructions && !isLocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="game-card max-w-md p-8 text-center space-y-6">
            <h1 className="game-title text-4xl font-bold">Timeless</h1>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg">A first-person shooter suspended in time</p>
              <div className="space-y-2 text-sm">
                <p><strong>WASD</strong> - Move</p>
                <p><strong>Mouse</strong> - Look around</p>
                <p><strong>Left Click</strong> - Shoot</p>
                <p><strong>ESC</strong> - Pause</p>
              </div>
            </div>
            <Button
              size="lg"
              className="game-button"
              onClick={handleStartClick}
            >
              Click to Start
            </Button>
          </div>
        </div>
      )}

      {gameInit.isInitialized && (
        <Canvas
          key={canvasKey}
          shadows
          camera={{ fov: 75, near: 0.1, far: 1000 }}
          className="bg-background"
          onCreated={({ gl, scene, camera }) => {
            try {
              console.log('🎨 Canvas created successfully at', new Date().toISOString());
              
              // Access WebGL context for detailed info
              const glContext = gl.getContext();
              console.log('🖼️ WebGL Renderer info:', {
                vendor: glContext.getParameter(glContext.VENDOR),
                renderer: glContext.getParameter(glContext.RENDERER),
                version: glContext.getParameter(glContext.VERSION),
              });
              
              console.log('📷 Camera type:', camera.type);
              if ('fov' in camera) {
                console.log('📷 Camera FOV:', (camera as any).fov);
              }
              console.log('🌍 Scene children:', scene.children.length);
            } catch (error) {
              console.error('❌ Error in onCreated callback:', error);
              handleCanvasError(error);
            }
          }}
          onError={handleCanvasError}
        >
          <color attach="background" args={['#0a0a0f']} />
          <fog attach="fog" args={['#0a0a0f', 10, 50]} />
          
          <ambientLight intensity={0.3} color="#8899aa" />
          <directionalLight
            position={[10, 20, 10]}
            intensity={0.5}
            color="#aabbcc"
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[0, 5, 0]} intensity={0.3} color="#99aacc" />

          <Suspense fallback={null}>
            <Physics gravity={[0, -20, 0]}>
              <Player
                ammunition={gameState.ammunition}
                onShoot={gameState.decrementAmmo}
                onEnemyHit={handleEnemyHit}
                enemies={enemies}
              />
              <Arena enemies={enemies} />
            </Physics>
          </Suspense>

          <PointerLockControls
            ref={pointerLockControlsRef}
            onLock={handleLock}
            onUnlock={handleUnlock}
          />
        </Canvas>
      )}

      {isLocked && gameInit.isInitialized && (
        <HUD
          health={gameState.health}
          ammunition={gameState.ammunition}
          score={gameState.score}
        />
      )}
    </div>
  );
}
