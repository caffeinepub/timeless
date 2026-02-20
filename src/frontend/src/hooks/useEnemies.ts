import { useState, useCallback } from 'react';
import { Vector3 } from 'three';

export interface Enemy {
  id: string;
  position: Vector3;
  health: number;
  maxHealth: number;
  isDestroyed: boolean;
}

export function useEnemies() {
  const [enemies, setEnemies] = useState<Enemy[]>([
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
  ]);

  const damageEnemy = useCallback((enemyId: string, damage: number) => {
    let enemyDefeated = false;
    setEnemies((prev) =>
      prev.map((enemy) => {
        if (enemy.id === enemyId && !enemy.isDestroyed) {
          const newHealth = Math.max(0, enemy.health - damage);
          const isDestroyed = newHealth <= 0;
          if (isDestroyed && !enemy.isDestroyed) {
            enemyDefeated = true;
          }
          return { ...enemy, health: newHealth, isDestroyed };
        }
        return enemy;
      })
    );
    return enemyDefeated;
  }, []);

  return { enemies, damageEnemy };
}
