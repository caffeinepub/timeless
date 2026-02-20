import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import type { Enemy } from '../hooks/useEnemies';
import * as THREE from 'three';

interface EnemyProps {
  enemy: Enemy;
}

export default function EnemyComponent({ enemy }: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [ref] = useBox(() => ({
    position: [enemy.position.x, enemy.position.y, enemy.position.z],
    args: [1.5, 2, 1.5],
    type: 'Static',
  }));

  const healthPercent = enemy.health / enemy.maxHealth;
  const hitColor = healthPercent > 0.5 ? '#6a7a9a' : healthPercent > 0.25 ? '#8a6a7a' : '#9a5a6a';

  useFrame((state) => {
    if (meshRef.current && !enemy.isDestroyed) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  if (enemy.isDestroyed) {
    return null;
  }

  return (
    <group ref={ref} data-enemy={enemy.id}>
      <mesh ref={meshRef} castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 2, 1.5]} />
        <meshStandardMaterial
          color={hitColor}
          roughness={0.6}
          metalness={0.4}
          emissive={hitColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0, 1.2, 0.76]}>
        <planeGeometry args={[1.2, 0.2]} />
        <meshBasicMaterial color="#1a1a22" />
      </mesh>
      <mesh position={[0, 1.2, 0.77]} scale={[healthPercent, 1, 1]}>
        <planeGeometry args={[1.2, 0.15]} />
        <meshBasicMaterial color="#5a8a7a" />
      </mesh>
    </group>
  );
}
