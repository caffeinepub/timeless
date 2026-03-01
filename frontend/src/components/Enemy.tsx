import { useRef, useEffect } from 'react';
import { useBox } from '@react-three/cannon';
import type { Enemy } from '../hooks/useEnemies';
import * as THREE from 'three';

interface EnemyProps {
  enemy: Enemy;
}

// Shared geometry and material for all enemies (instancing optimization)
const sharedGeometry = new THREE.BoxGeometry(1, 2, 1);
const sharedMaterial = new THREE.MeshStandardMaterial({
  color: '#ff4444',
  roughness: 0.7,
  metalness: 0.3,
});

export default function EnemyComponent({ enemy }: EnemyProps) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position: [enemy.position.x, enemy.position.y, enemy.position.z],
    args: [1, 2, 1],
  }));

  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    // Set userData for raycasting identification
    if (meshRef.current) {
      meshRef.current.userData.isEnemy = true;
      meshRef.current.userData.enemyId = enemy.id;
      
      // Traverse children and set userData on all
      meshRef.current.traverse((child) => {
        child.userData.isEnemy = true;
        child.userData.enemyId = enemy.id;
      });
    }
  }, [enemy.id]);

  if (enemy.isDestroyed) {
    return null;
  }

  const healthPercentage = (enemy.health / enemy.maxHealth) * 100;

  return (
    <group ref={ref}>
      <mesh ref={meshRef} castShadow receiveShadow geometry={sharedGeometry} material={sharedMaterial} />
      {/* Health bar */}
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[1, 0.1]} />
        <meshBasicMaterial color="#222222" />
      </mesh>
      <mesh position={[-(1 - healthPercentage / 100) / 2, 1.5, 0.01]}>
        <planeGeometry args={[healthPercentage / 100, 0.08]} />
        <meshBasicMaterial color="#44ff44" />
      </mesh>
    </group>
  );
}
