import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3, Vector2 } from 'three';
import { usePlayerControls } from '../hooks/usePlayerControls';
import { useWeapon } from '../hooks/useWeapon';
import MuzzleFlash from './MuzzleFlash';
import type { Enemy } from '../hooks/useEnemies';

interface PlayerProps {
  ammunition: number;
  onShoot: () => void;
  onEnemyHit: (enemyId: string) => void;
  enemies: Enemy[];
  onSpawned?: () => void;
}

export default function Player({ ammunition, onShoot, onEnemyHit, enemies, onSpawned }: PlayerProps) {
  const { camera, raycaster, scene } = useThree();
  const { controls } = usePlayerControls();
  const { weaponState, fire } = useWeapon();
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  const isMountedRef = useRef(true);
  const spawnedCalledRef = useRef(false);

  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 2, 10],
    args: [0.5],
    fixedRotation: true,
  }));

  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 2, 10]);

  useEffect(() => {
    const startTime = performance.now();
    console.log('🎮 Player component mounted at', new Date().toISOString(), '/', startTime.toFixed(2), 'ms');
    isMountedRef.current = true;

    // Mark player as spawned
    if (!spawnedCalledRef.current) {
      spawnedCalledRef.current = true;
      console.log('✅ Player spawned');
      onSpawned?.();
    }

    const unsubscribeVel = api.velocity.subscribe((v) => {
      if (isMountedRef.current) {
        velocity.current = v;
      }
    });

    const unsubscribePos = api.position.subscribe((p) => {
      if (isMountedRef.current) {
        position.current = p;
      }
    });

    const handleMouseDown = (e: MouseEvent) => {
      if (!isMountedRef.current) return;
      
      try {
        if (e.button === 0 && document.pointerLockElement) {
          if (ammunition > 0) {
            const didFire = fire();
            if (didFire) {
              onShoot();
              setShowMuzzleFlash(true);
              setTimeout(() => {
                if (isMountedRef.current) {
                  setShowMuzzleFlash(false);
                }
              }, 100);

              // Raycast to check for enemy hits
              raycaster.setFromCamera(new Vector2(0, 0), camera);
              
              // Find all enemy meshes in the scene
              const enemyMeshes: any[] = [];
              scene.traverse((object) => {
                if (object.userData.isEnemy) {
                  enemyMeshes.push(object);
                }
              });

              const intersects = raycaster.intersectObjects(enemyMeshes, true);

              if (intersects.length > 0) {
                const hitObject = intersects[0].object;
                // Find the enemy by checking userData
                let currentObject: any = hitObject;
                while (currentObject && !currentObject.userData.enemyId) {
                  currentObject = currentObject.parent;
                }
                
                if (currentObject && currentObject.userData.enemyId) {
                  const enemyId = currentObject.userData.enemyId;
                  const hitEnemy = enemies.find((e) => e.id === enemyId);
                  if (hitEnemy && !hitEnemy.isDestroyed) {
                    onEnemyHit(enemyId);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in mousedown handler:', error);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isMountedRef.current) return;
      
      try {
        if (e.button === 0) {
          // Weapon state is managed internally by useWeapon
        }
      } catch (error) {
        console.error('❌ Error in mouseup handler:', error);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      const endTime = performance.now();
      const lifetime = endTime - startTime;
      console.log('🎮 Player component unmounting at', new Date().toISOString());
      console.log('⏱️ Player lifetime:', lifetime.toFixed(2), 'ms');
      isMountedRef.current = false;
      
      unsubscribeVel();
      unsubscribePos();
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      console.log('✅ Player component cleanup complete');
    };
  }, [ammunition, onShoot, onEnemyHit, enemies, camera, raycaster, scene, fire, api.velocity, api.position, onSpawned]);

  useFrame(() => {
    if (!isMountedRef.current) return;

    try {
      camera.position.set(position.current[0], position.current[1], position.current[2]);

      const direction = new Vector3();
      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();

      const right = new Vector3();
      right.crossVectors(camera.up, direction).normalize();

      const moveSpeed = 5;
      const newVelocity = new Vector3(0, velocity.current[1], 0);

      if (controls.forward) {
        newVelocity.add(direction.multiplyScalar(moveSpeed));
      }
      if (controls.backward) {
        newVelocity.add(direction.multiplyScalar(-moveSpeed));
      }
      if (controls.left) {
        newVelocity.add(right.multiplyScalar(moveSpeed));
      }
      if (controls.right) {
        newVelocity.add(right.multiplyScalar(-moveSpeed));
      }

      api.velocity.set(newVelocity.x, newVelocity.y, newVelocity.z);
    } catch (error) {
      console.error('❌ Error in Player useFrame:', error);
    }
  });

  return (
    <>
      <mesh ref={ref} />
      {showMuzzleFlash && <MuzzleFlash camera={camera} />}
    </>
  );
}
