import { useBox, usePlane } from "@react-three/cannon";
import { useTexture } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Enemy } from "../hooks/useEnemies";
import EnemyComponent from "./Enemy";

interface ArenaProps {
  enemies: Enemy[];
  onArenaLoaded?: () => void;
  onEnemiesSpawned?: () => void;
  level?: number;
}

function getLevelLighting(level: number): {
  ambientColor: string;
  ambientIntensity: number;
} {
  if (level <= 3) {
    return { ambientColor: "#1a2a4a", ambientIntensity: 0.4 };
  }
  if (level <= 6) {
    return { ambientColor: "#3a2a10", ambientIntensity: 0.45 };
  }
  return { ambientColor: "#3a0a0a", ambientIntensity: 0.5 };
}

function getObstaclesForLevel(level: number): Array<{
  position: [number, number, number];
  args: [number, number, number];
}> {
  const base: Array<{
    position: [number, number, number];
    args: [number, number, number];
  }> = [
    { position: [5, 1, -5], args: [2, 2, 2] },
    { position: [-7, 1, -8], args: [3, 2, 3] },
    { position: [12, 1, -10], args: [2, 2, 4] },
  ];

  const extra: Array<{
    position: [number, number, number];
    args: [number, number, number];
  }> = [
    { position: [-10, 1.5, -15], args: [4, 3, 2] },
    { position: [8, 1, 8], args: [3, 2, 3] },
    { position: [-15, 1, 10], args: [2, 2, 5] },
    { position: [18, 1, -5], args: [2, 3, 2] },
    { position: [-5, 1, 15], args: [3, 2, 2] },
    { position: [10, 1, 12], args: [2, 4, 2] },
    { position: [-18, 1.5, -8], args: [3, 3, 3] },
    { position: [0, 1, -18], args: [4, 2, 2] },
    { position: [15, 1, 5], args: [2, 2, 4] },
    { position: [-12, 1, 0], args: [3, 3, 2] },
    { position: [3, 1, 18], args: [2, 2, 3] },
    { position: [-20, 1, 15], args: [3, 2, 3] },
    { position: [20, 1, -15], args: [2, 3, 2] },
  ];

  const extraCount = Math.min(extra.length, Math.round((level - 1) * 1.44));
  return [...base, ...extra.slice(0, extraCount)];
}

export default function Arena({
  enemies,
  onArenaLoaded,
  onEnemiesSpawned,
  level = 1,
}: ArenaProps) {
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [geometryReady, setGeometryReady] = useState(false);
  const isMountedRef = useRef(true);
  const arenaLoadedCalledRef = useRef(false);
  const enemiesSpawnedCalledRef = useRef(false);
  const skyboxTextureRef = useRef<THREE.Texture | null>(null);

  const skyboxTexture = useTexture(
    "/assets/generated/skybox.dim_2048x2048.png",
    (tex) => {
      skyboxTextureRef.current = tex;
      setTextureLoaded(true);
    },
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      skyboxTextureRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (textureLoaded && geometryReady && !arenaLoadedCalledRef.current) {
      arenaLoadedCalledRef.current = true;
      onArenaLoaded?.();
    }
  }, [textureLoaded, geometryReady, onArenaLoaded]);

  useEffect(() => {
    if (enemies.length > 0 && !enemiesSpawnedCalledRef.current) {
      enemiesSpawnedCalledRef.current = true;
      onEnemiesSpawned?.();
    }
  }, [enemies.length, onEnemiesSpawned]);

  const [floorRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: "Static",
  }));

  const wallGeometry = useRef(new THREE.BoxGeometry(1, 1, 1));
  const obstacleGeometry = useRef(new THREE.BoxGeometry(1, 1, 1));

  useEffect(() => {
    if (!geometryReady) setGeometryReady(true);
  }, [geometryReady]);

  const lighting = getLevelLighting(level);
  const obstacles = getObstaclesForLevel(level);

  const walls: Array<{
    position: [number, number, number];
    args: [number, number, number];
  }> = [
    { position: [0, 5, -25], args: [50, 10, 1] },
    { position: [0, 5, 25], args: [50, 10, 1] },
    { position: [-25, 5, 0], args: [1, 10, 50] },
    { position: [25, 5, 0], args: [1, 10, 50] },
  ];

  const Wall = ({
    position,
    args,
  }: {
    position: [number, number, number];
    args: [number, number, number];
  }) => {
    const [ref] = useBox(() => ({ type: "Static", position, args }));
    return (
      <mesh ref={ref} castShadow receiveShadow geometry={wallGeometry.current}>
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} metalness={0.2} />
      </mesh>
    );
  };

  const Obstacle = ({
    position,
    args,
  }: {
    position: [number, number, number];
    args: [number, number, number];
  }) => {
    const [ref] = useBox(() => ({ type: "Static", position, args }));
    return (
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        geometry={obstacleGeometry.current}
      >
        <meshStandardMaterial color="#2a2a3e" roughness={0.7} metalness={0.3} />
      </mesh>
    );
  };

  return (
    <group>
      <ambientLight
        color={lighting.ambientColor}
        intensity={lighting.ambientIntensity}
      />

      <mesh ref={floorRef} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#16213e" roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial map={skyboxTexture} side={THREE.BackSide} />
      </mesh>

      {walls.map((wall) => (
        <Wall
          key={`wall-${wall.position.join(",")}`}
          position={wall.position}
          args={wall.args}
        />
      ))}

      {obstacles.map((obstacle) => (
        <Obstacle
          key={`obstacle-${obstacle.position.join(",")}`}
          position={obstacle.position}
          args={obstacle.args}
        />
      ))}

      {enemies.map((enemy) => (
        <EnemyComponent key={enemy.id} enemy={enemy} />
      ))}
    </group>
  );
}
