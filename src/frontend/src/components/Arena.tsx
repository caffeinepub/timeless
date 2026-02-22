import { useTexture } from '@react-three/drei';
import { usePlane, useBox } from '@react-three/cannon';
import { useEffect, useRef } from 'react';
import type { Enemy } from '../hooks/useEnemies';
import EnemyComponent from './Enemy';

interface ArenaProps {
  enemies: Enemy[];
}

export default function Arena({ enemies }: ArenaProps) {
  const skyboxTexture = useTexture('/assets/generated/skybox.dim_2048x2048.png');
  const isMountedRef = useRef(true);

  useEffect(() => {
    console.log('🏟️ Arena component mounted at', new Date().toISOString());
    console.log('🖼️ Skybox texture loaded:', !!skyboxTexture);
    console.log('👾 Rendering', enemies.length, 'enemies');
    isMountedRef.current = true;

    return () => {
      console.log('🏟️ Arena component unmounting at', new Date().toISOString());
      isMountedRef.current = false;
      
      // Dispose of texture
      if (skyboxTexture) {
        console.log('🧹 Disposing skybox texture');
        skyboxTexture.dispose();
      }
      
      console.log('✅ Arena component cleanup complete');
    };
  }, []);

  const [floorRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static',
  }));

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
    { position: [8, 1, -18], args: [2, 2, 2] },
  ];

  try {
    return (
      <>
        <mesh ref={floorRef} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.8} metalness={0.2} />
        </mesh>

        <mesh position={[0, 25, 0]}>
          <sphereGeometry args={[40, 32, 32]} />
          <meshBasicMaterial map={skyboxTexture} side={2} opacity={0.3} transparent />
        </mesh>

        {walls.map((wall, i) => (
          <Wall key={`wall-${i}`} {...wall} />
        ))}

        {obstacles.map((obstacle, i) => (
          <Obstacle key={`obstacle-${i}`} {...obstacle} />
        ))}

        {enemies.map((enemy) => (
          <EnemyComponent key={enemy.id} enemy={enemy} />
        ))}
      </>
    );
  } catch (error) {
    console.error('❌ Error rendering Arena:', error);
    throw error;
  }
}

function Wall({ position, args }: { position: [number, number, number]; args: [number, number, number] }) {
  const [ref] = useBox(() => ({
    position,
    args,
    type: 'Static',
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#2a2a35" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

function Obstacle({ position, args }: { position: [number, number, number]; args: [number, number, number] }) {
  const [ref] = useBox(() => ({
    position,
    args,
    type: 'Static',
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color="#3a3a48"
        roughness={0.7}
        metalness={0.3}
        emissive="#4a4a58"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}
