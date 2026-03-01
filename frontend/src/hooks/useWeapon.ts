import { useRef, useCallback, useEffect } from 'react';

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

  const muzzleFlashTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    console.log('🔫 Weapon hook initialized at', new Date().toISOString());
    isMountedRef.current = true;

    return () => {
      console.log('🔫 Weapon hook cleaning up at', new Date().toISOString());
      isMountedRef.current = false;
      
      // Clear any active timers
      if (muzzleFlashTimerRef.current) {
        clearTimeout(muzzleFlashTimerRef.current);
        console.log('⏱️ Muzzle flash timer cleared');
      }
      
      // Reset weapon state
      weaponState.current = {
        isFiring: false,
        lastFireTime: 0,
        showMuzzleFlash: false,
      };
      
      console.log('✅ Weapon hook cleanup complete');
    };
  }, []);

  const fire = useCallback(() => {
    if (!isMountedRef.current) {
      console.log('⏭️ Weapon unmounted, ignoring fire');
      return false;
    }

    const now = Date.now();
    if (now - weaponState.current.lastFireTime < fireRate) {
      return false;
    }

    weaponState.current.lastFireTime = now;
    weaponState.current.showMuzzleFlash = true;
    weaponState.current.isFiring = true;

    // Clear any existing timer
    if (muzzleFlashTimerRef.current) {
      clearTimeout(muzzleFlashTimerRef.current);
    }

    muzzleFlashTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        weaponState.current.showMuzzleFlash = false;
        weaponState.current.isFiring = false;
      }
    }, 100);

    return true;
  }, [fireRate]);

  return { weaponState: weaponState.current, fire };
}
