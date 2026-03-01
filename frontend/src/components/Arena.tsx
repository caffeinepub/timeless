import { useTexture } from '@react-three/drei';
import { usePlane, useBox } from '@react-three/cannon';
import { useEffect, useRef, useState } from 'react';
import type { Enemy } from '../hooks/useEnemies';
import EnemyComponent from './Enemy';
import * as THREE from 'three';

interface ArenaProps {
  enemies: Enemy[];
  onArenaLoaded?: () => void;
  onEnemiesSpawned?: () => void;
}

export default function Arena({ enemies, onArenaLoaded, onEnemiesSpawned }: ArenaProps) {
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [geometryReady, setGeometryReady] = useState(false);
  const isMountedRef = useRef(true);
  const mountTimeRef = useRef(performance.now());
  const arenaLoadedCalledRef = useRef(false);
  const enemiesSpawnedCalledRef = useRef(false);
  
  // Load skybox texture asynchronously
  const skyboxTexture = useTexture('/assets/generated/skybox.dim_2048x2048.png', (texture) => {
    const loadTime = performance.now() - mountTimeRef.current;
    console.log('🖼️ Skybox texture loaded in', loadTime.toFixed(2), 'ms');
    setTextureLoaded(true);
  });

  useEffect(() => {
    const startTime = performance.now();
    console.log('🏟️ Arena component mounted at', new Date().toISOString(), '/', startTime.toFixed(2), 'ms');
    console.log('👾 Rendering', enemies.length, 'enemies');
    isMountedRef.current = true;

    return () => {
      const endTime = performance.now();
      const lifetime = endTime - startTime;
      console.log('🏟️ Arena component unmounting at', new Date().toISOString());
      console.log('⏱️ Arena lifetime:', lifetime.toFixed(2), 'ms');
      isMountedRef.current = false;
      
      // Dispose of texture
      if (skyboxTexture) {
        console.log('🧹 Disposing skybox texture');
        skyboxTexture.dispose();
      }
      
      console.log('✅ Arena component cleanup complete');
    };
  }, []);

  // Mark arena as loaded when texture and geometry are ready
  useEffect(() => {
    if (textureLoaded && geometryReady && !arenaLoadedCalledRef.current) {
      const timestamp = performance.now();
      console.log('✅ Arena fully loaded at', timestamp.toFixed(2), 'ms');
      arenaLoadedCalledRef.current = true;
      onArenaLoaded?.();
    }
  }, [textureLoaded, geometryReady, onArenaLoaded]);

  // Mark enemies as spawned when they're rendered
  useEffect(() => {
    if (enemies.length > 0 && !enemiesSpawnedCalledRef.current) {
      const timestamp = performance.now();
      console.log('✅ Enemies spawned at', timestamp.toFixed(2), 'ms - count:', enemies.length);
      enemiesSpawnedCalledRef.current = true;
      onEnemiesSpawned?.();
    }
  }, [enemies.length, onEnemiesSpawned]);

  const [floorRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static',
  }));

  // Shared geometries for instancing
  const wallGeometry = useRef(new THREE.BoxGeometry(1, 1, 1));
  const obstacleGeometry = useRef(new THREE.BoxGeometry(1, 1, 1));

  // Mark geometry as ready after first render
  useEffect(() => {
    if (!geometryReady) {
      setGeometryReady(true);
      console.log('📦 Arena geometry initialized');
    }
  }, [geometryReady]);

  const walls: Array<{ position: [number, number, number]; args: [number, number, number] }> = [
    { position: [0, 5, -25], args: [50, 10, 1] },
    { position: [0, 5, 25], args: [50, 10, 1] },
    { position: [-25, 5, 0], args: [1, 10, 50] },
    { position: [25, 5, 0], args: [1, 10, 50] },
  ];

  const obstacles: Array<{ position: [number, number, number]; args: [number, number, number] }> = [
    { position: [5, 1, -5], args: [2, 2, 2] },
    { position: [-7, 1, -8], args: [3, 2, 3] },
    { position: [12, 1, -10], args: [2, 2, 4] },
    { position: [-10, 1.5, -15], args: [4, 3, 2] },
    { position: [8, 1, 8], args: [3, 2, 3] },
    { position: [-15, 1, 10], args: [2, 2, 5] },
  ];

  const Wall = ({ position, args }: { position: [number, number, number]; args: [number, number, number] }) => {
    const [ref] = useBox(() => ({
      type: 'Static',
      position,
      args,
    }));

    return (
      <mesh ref={ref} castShadow receiveShadow geometry={wallGeometry.current}>
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} metalness={0.2} />
      </mesh>
    );
  };

  const Obstacle = ({ position, args }: { position: [number, number, number]; args: [number, number, number] }) => {
    const [ref] = useBox(() => ({
      type: 'Static',
      position,
      args,
    }));

    return (
      <mesh ref={ref} castShadow receiveShadow geometry={obstacleGeometry.current}>
        <meshStandardMaterial color="#2a2a3e" roughness={0.7} metalness={0.3} />
      </mesh>
    );
  };

  return (
    <group>
      {/* Floor */}
      <mesh ref={floorRef} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#16213e" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Skybox */}
      <mesh>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial map={skyboxTexture} side={THREE.BackSide} />
      </mesh>

      {/* Walls */}
      {walls.map((wall, index) => (
        <Wall key={`wall-${index}`} position={wall.position} args={wall.args} />
      ))}

      {/* Obstacles */}
      {obstacles.map((obstacle, index) => (
        <Obstacle key={`obstacle-${index}`} position={obstacle.position} args={obstacle.args} />
      ))}

      {/* Enemies */}
      {enemies.map((enemy) => (
        <EnemyComponent key={enemy.id} enemy={enemy} />
      ))}
    </group>
  );
}
