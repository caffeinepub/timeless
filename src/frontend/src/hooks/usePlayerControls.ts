import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';

export interface PlayerControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  mouseMovement: { x: number; y: number };
}

export function usePlayerControls() {
  const controls = useRef<PlayerControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    mouseMovement: { x: 0, y: 0 },
  });

  const mouseMovement = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          controls.current.forward = true;
          break;
        case 'KeyS':
          controls.current.backward = true;
          break;
        case 'KeyA':
          controls.current.left = true;
          break;
        case 'KeyD':
          controls.current.right = true;
          break;
        case 'Space':
          controls.current.jump = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          controls.current.forward = false;
          break;
        case 'KeyS':
          controls.current.backward = false;
          break;
        case 'KeyA':
          controls.current.left = false;
          break;
        case 'KeyD':
          controls.current.right = false;
          break;
        case 'Space':
          controls.current.jump = false;
          break;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseMovement.current.x += e.movementX;
      mouseMovement.current.y += e.movementY;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const getMouseMovement = () => {
    const movement = { ...mouseMovement.current };
    mouseMovement.current = { x: 0, y: 0 };
    return movement;
  };

  return { controls: controls.current, getMouseMovement };
}
