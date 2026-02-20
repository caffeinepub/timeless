import { useRef, useCallback } from 'react';

export interface WeaponState {
  isFiring: boolean;
  lastFireTime: number;
  showMuzzleFlash: boolean;
}

export function useWeapon(fireRate: number = 200) {
  const weaponState = useRef<WeaponState>({
    isFiring: false,
    lastFireTime: 0,
    showMuzzleFlash: false,
  });

  const fire = useCallback(() => {
    const now = Date.now();
    if (now - weaponState.current.lastFireTime < fireRate) {
      return false;
    }

    weaponState.current.lastFireTime = now;
    weaponState.current.showMuzzleFlash = true;
    weaponState.current.isFiring = true;

    setTimeout(() => {
      weaponState.current.showMuzzleFlash = false;
      weaponState.current.isFiring = false;
    }, 100);

    return true;
  }, [fireRate]);

  return { weaponState: weaponState.current, fire };
}
