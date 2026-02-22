import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3, Vector2, Raycaster } from 'three';
import { usePlayerControls } from '../hooks/usePlayerControls';
import { useWeapon } from '../hooks/useWeapon';
import MuzzleFlash from './MuzzleFlash';
import type { Enemy } from '../hooks/useEnemies';

interface PlayerProps {
  ammunition: number;
  onShoot: () => void;
  onEnemyHit: (enemyId: string) => void;
  enemies: Enemy[];
}

export default function Player({ ammunition, onShoot, onEnemyHit, enemies }: PlayerProps) {
  const { camera, gl } = useThree();
  const { controls, getMouseMovement } = usePlayerControls();
  const { weaponState, fire } = useWeapon();
  const raycaster = useRef(new Raycaster());
  const velocity = useRef(new Vector3());
  const rotation = useRef({ x: 0, y: 0 });
  const isMountedRef = useRef(true);

  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 2, 5],
    args: [0.5],
    fixedRotation: true,
  }));

  const position = useRef([0, 2, 5]);

  useEffect(() => {
    console.log('🎮 Player component mounted at', new Date().toISOString());
    console.log('📷 Camera available:', !!camera);
    console.log('🖼️ GL context available:', !!gl);
    isMountedRef.current = true;

    try {
      const unsubscribe = api.position.subscribe((p) => {
        if (isMountedRef.current) {
          position.current = p;
        }
      });

      return () => {
        console.log('🎮 Player component unmounting at', new Date().toISOString());
        isMountedRef.current = false;
        unsubscribe();
        console.log('🧹 Player position subscription cleaned up');
        console.log('✅ Player component cleanup complete');
      };
    } catch (error) {
      console.error('❌ Error setting up Player physics subscription:', error);
      throw error;
    }
  }, [api, camera, gl]);

  useEffect(() => {
    if (!gl?.domElement) {
      console.warn('⚠️ GL domElement not available, skipping click handler setup');
      return;
    }

    const handleClick = () => {
      if (!isMountedRef.current) {
        console.log('⏭️ Player unmounted, ignoring click');
        return;
      }

      try {
        if (ammunition > 0 && fire()) {
          console.log('🔫 Firing weapon, ammo:', ammunition);
          onShoot();

          raycaster.current.setFromCamera(new Vector2(0, 0), camera);

          enemies.forEach((enemy) => {
            if (enemy.isDestroyed) return;
            
            const direction = new Vector3()
              .subVectors(enemy.position, camera.position)
              .normalize();
            const distance = camera.position.distanceTo(enemy.position);
            
            raycaster.current.set(camera.position, direction);
            
            if (distance < 50) {
              const angle = raycaster.current.ray.direction.angleTo(direction);
              if (angle < 0.3) {
                console.log('🎯 Hit enemy:', enemy.id, 'at distance:', distance.toFixed(2));
                onEnemyHit(enemy.id);
              }
            }
          });
        } else if (ammunition <= 0) {
          console.log('🚫 Out of ammunition');
        }
      } catch (error) {
        console.error('❌ Error in click handler:', error);
      }
    };

    console.log('🖱️ Adding click event listener to canvas');
    gl.domElement.addEventListener('click', handleClick);
    
    return () => {
      console.log('🖱️ Removing click event listener from canvas');
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [ammunition, fire, onShoot, camera, gl, onEnemyHit, enemies]);

  useFrame(() => {
    if (!isMountedRef.current) return;

    try {
      const [x, y, z] = position.current;
      camera.position.set(x, y, z);

      const mouseMovement = getMouseMovement();
      rotation.current.y -= mouseMovement.x * 0.002;
      rotation.current.x -= mouseMovement.y * 0.002;
      rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x));

      camera.rotation.set(rotation.current.x, rotation.current.y, 0, 'YXZ');

      const direction = new Vector3();
      const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

      forward.y = 0;
      forward.normalize();
      right.y = 0;
      right.normalize();

      velocity.current.set(0, 0, 0);

      if (controls.forward) velocity.current.add(forward.multiplyScalar(5));
      if (controls.backward) velocity.current.add(forward.multiplyScalar(-5));
      if (controls.left) velocity.current.add(right.multiplyScalar(-5));
      if (controls.right) velocity.current.add(right.multiplyScalar(5));

      api.velocity.set(velocity.current.x, 0, velocity.current.z);
    } catch (error) {
      console.error('❌ Error in Player useFrame:', error);
    }
  });

  return (
    <>
      <mesh ref={ref} />
      {weaponState.showMuzzleFlash && <MuzzleFlash camera={camera} />}
    </>
  );
}
