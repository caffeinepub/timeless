import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type * as THREE from "three";
import type { Enemy } from "../hooks/useEnemies";

interface EnemyProps {
  enemy: Enemy;
}

export default function EnemyComponent({ enemy }: EnemyProps) {
  const [ref] = useBox(() => ({
    type: "Static",
    position: [enemy.position.x, enemy.position.y, enemy.position.z],
    args: [1, 2, 1],
  }));

  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Refs for animated limbs
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData.isEnemy = true;
      groupRef.current.userData.enemyId = enemy.id;
      groupRef.current.traverse((child) => {
        child.userData.isEnemy = true;
        child.userData.enemyId = enemy.id;
      });
    }
  }, [enemy.id]);

  useFrame((_state, delta) => {
    if (enemy.isDestroyed) return;
    timeRef.current += delta * 2.5;
    const t = timeRef.current;
    const swing = Math.sin(t) * 0.4;

    if (leftArmRef.current) leftArmRef.current.rotation.x = swing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
    if (leftLegRef.current) leftLegRef.current.rotation.x = -swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = swing;

    // Slight body bob
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 2) * 0.04;
    }
  });

  if (enemy.isDestroyed) {
    return null;
  }

  const healthPercentage = (enemy.health / enemy.maxHealth) * 100;

  // Materials
  const bodyMat = (
    <meshStandardMaterial color="#2d4a2d" roughness={0.8} metalness={0.1} />
  );
  const headMat = (
    <meshStandardMaterial color="#c8a882" roughness={0.8} metalness={0} />
  );

  return (
    <group ref={ref}>
      {/* Humanoid body group */}
      <group ref={bodyRef}>
        {/* Head */}
        <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          {headMat}
        </mesh>

        {/* Torso */}
        <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[0.5, 0.55, 0.25]} />
          {bodyMat}
        </mesh>

        {/* Left arm — pivot from shoulder */}
        <mesh
          ref={leftArmRef}
          castShadow
          receiveShadow
          position={[-0.38, 0.28, 0]}
        >
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          {bodyMat}
        </mesh>

        {/* Right arm */}
        <mesh
          ref={rightArmRef}
          castShadow
          receiveShadow
          position={[0.38, 0.28, 0]}
        >
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          {bodyMat}
        </mesh>

        {/* Left leg — pivot from hip */}
        <mesh
          ref={leftLegRef}
          castShadow
          receiveShadow
          position={[-0.15, -0.3, 0]}
        >
          <boxGeometry args={[0.18, 0.55, 0.18]} />
          {bodyMat}
        </mesh>

        {/* Right leg */}
        <mesh
          ref={rightLegRef}
          castShadow
          receiveShadow
          position={[0.15, -0.3, 0]}
        >
          <boxGeometry args={[0.18, 0.55, 0.18]} />
          {bodyMat}
        </mesh>
      </group>

      {/* Health bar — stays above head, not part of animated group */}
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
