import { useEffect, useRef } from 'react';

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
  const isMountedRef = useRef(true);

  useEffect(() => {
    console.log('⌨️ Player controls hook initialized at', new Date().toISOString());
    isMountedRef.current = true;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMountedRef.current) return;
      
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
      if (!isMountedRef.current) return;
      
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
      if (!isMountedRef.current) return;
      mouseMovement.current.x = e.movementX || 0;
      mouseMovement.current.y = e.movementY || 0;
    };

    console.log('⌨️ Adding keyboard and mouse event listeners');
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      console.log('⌨️ Removing keyboard and mouse event listeners at', new Date().toISOString());
      isMountedRef.current = false;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      
      // Reset controls
      controls.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        mouseMovement: { x: 0, y: 0 },
      };
      mouseMovement.current = { x: 0, y: 0 };
      
      console.log('✅ Player controls cleanup complete');
    };
  }, []);

  const getMouseMovement = () => {
    const movement = { ...mouseMovement.current };
    mouseMovement.current = { x: 0, y: 0 };
    return movement;
  };

  return { controls: controls.current, getMouseMovement };
}
