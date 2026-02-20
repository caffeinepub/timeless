import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { Suspense, useEffect, useState } from 'react';
import Player from './Player';
import Arena from './Arena';
import HUD from './HUD';
import { useGameState } from '../hooks/useGameState';
import { useEnemies } from '../hooks/useEnemies';
import { Button } from '@/components/ui/button';

export default function Game() {
  const [isLocked, setIsLocked] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const gameState = useGameState();
  const { enemies, damageEnemy } = useEnemies();

  useEffect(() => {
    if (isLocked && !gameState.isGameStarted) {
      gameState.initializeGame();
    }
  }, [isLocked, gameState]);

  const handleEnemyHit = (enemyId: string) => {
    const defeated = damageEnemy(enemyId, 34);
    if (defeated) {
      gameState.handleEnemyDefeat();
    }
  };

  return (
    <div className="relative w-full h-full">
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
              onClick={() => setShowInstructions(false)}
            >
              Click to Start
            </Button>
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        className="bg-background"
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
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
        />
      </Canvas>

      {isLocked && (
        <HUD
          health={gameState.health}
          ammunition={gameState.ammunition}
          score={gameState.score}
        />
      )}
    </div>
  );
}
