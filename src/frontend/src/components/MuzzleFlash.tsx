import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface MuzzleFlashProps {
  camera: THREE.Camera;
}

export default function MuzzleFlash({ camera }: MuzzleFlashProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/assets/generated/muzzle-flash.dim_256x256.png');
  const opacity = useRef(1);

  useEffect(() => {
    opacity.current = 1;
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      const offset = new THREE.Vector3(0.3, -0.2, -0.5);
      offset.applyQuaternion(camera.quaternion);
      meshRef.current.position.copy(camera.position).add(offset);
      meshRef.current.quaternion.copy(camera.quaternion);

      opacity.current -= 0.1;
      if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
        meshRef.current.material.opacity = Math.max(0, opacity.current);
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[0.3, 0.3]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
