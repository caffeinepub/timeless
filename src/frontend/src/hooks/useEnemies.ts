import { useState, useCallback, useEffect } from 'react';
import { Vector3 } from 'three';

export interface Enemy {
  id: string;
  position: Vector3;
  health: number;
  maxHealth: number;
  isDestroyed: boolean;
}

const initialEnemies: Enemy[] = [
  {
    id: 'enemy-1',
    position: new Vector3(10, 1, -5),
    health: 100,
    maxHealth: 100,
    isDestroyed: false,
  },
  {
    id: 'enemy-2',
    position: new Vector3(-8, 1, -10),
    health: 100,
    maxHealth: 100,
    isDestroyed: false,
  },
  {
    id: 'enemy-3',
    position: new Vector3(0, 1, -15),
    health: 100,
    maxHealth: 100,
    isDestroyed: false,
  },
  {
    id: 'enemy-4',
    position: new Vector3(15, 1, -12),
    health: 100,
    maxHealth: 100,
    isDestroyed: false,
  },
  {
    id: 'enemy-5',
    position: new Vector3(-12, 1, -8),
    health: 100,
    maxHealth: 100,
    isDestroyed: false,
  },
];

export function useEnemies() {
  const [enemies, setEnemies] = useState<Enemy[]>(initialEnemies);

  useEffect(() => {
    console.log('👾 useEnemies hook initialized with', enemies.length, 'enemies at', new Date().toISOString());
    
    return () => {
      console.log('👾 useEnemies hook cleaning up at', new Date().toISOString());
      // Reset enemies to initial state on unmount
      setEnemies(initialEnemies);
      console.log('✅ Enemies reset to initial state');
    };
  }, []);

  const damageEnemy = useCallback((enemyId: string, damage: number) => {
    console.log('🎯 damageEnemy called:', { enemyId, damage, timestamp: new Date().toISOString() });
    let enemyDefeated = false;
    
    setEnemies((prev) =>
      prev.map((enemy) => {
        if (enemy.id === enemyId && !enemy.isDestroyed) {
          const newHealth = Math.max(0, enemy.health - damage);
          const isDestroyed = newHealth <= 0;
          
          if (isDestroyed && !enemy.isDestroyed) {
            enemyDefeated = true;
            console.log('💀 Enemy destroyed:', enemyId);
          }
          
          console.log('🩹 Enemy health updated:', {
            id: enemyId,
            oldHealth: enemy.health,
            newHealth,
            isDestroyed,
          });
          
          return { ...enemy, health: newHealth, isDestroyed };
        }
        return enemy;
      })
    );
    
    return enemyDefeated;
  }, []);

  return { enemies, damageEnemy };
}
