import { useCallback, useEffect, useState } from "react";
import { Vector3 } from "three";

export interface Enemy {
  id: string;
  position: Vector3;
  health: number;
  maxHealth: number;
  isDestroyed: boolean;
}

function generateEnemiesForLevel(level: number): Enemy[] {
  // Level 1 = 3 enemies, each subsequent adds ~1-2, up to ~15 at level 10
  const count = Math.min(15, 3 + Math.round((level - 1) * 1.33));
  // Health: 60 at level 1, 200 at level 10
  const health = Math.round(60 + (level - 1) * (140 / 9));
  // Spread: wider positions at higher levels
  const spread = 8 + (level - 1) * 1.5;

  const positions: Array<[number, number, number]> = [
    [spread * 0.8, 1, -spread * 0.5],
    [-spread * 0.75, 1, -spread * 0.6],
    [0, 1, -spread],
    [spread, 1, -spread * 0.8],
    [-spread * 0.5, 1, -spread * 1.1],
    [spread * 0.3, 1, -spread * 1.3],
    [-spread * 0.9, 1, -spread * 0.3],
    [spread * 1.1, 1, -spread * 0.4],
    [-spread * 0.2, 1, -spread * 0.7],
    [spread * 0.6, 1, -spread * 1.2],
    [-spread * 1.1, 1, -spread * 0.9],
    [spread * 0.9, 1, -spread * 0.2],
    [-spread * 0.4, 1, -spread * 1.4],
    [spread * 0.1, 1, -spread * 1.5],
    [-spread * 0.7, 1, -spread * 0.15],
  ];

  return positions.slice(0, count).map((pos, i) => ({
    id: `enemy-${i + 1}`,
    position: new Vector3(...pos),
    health,
    maxHealth: health,
    isDestroyed: false,
  }));
}

export function useEnemies(initialLevel = 1) {
  const [enemies, setEnemies] = useState<Enemy[]>(() =>
    generateEnemiesForLevel(initialLevel),
  );

  useEffect(() => {
    return () => {
      setEnemies(generateEnemiesForLevel(1));
    };
  }, []);

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
      }),
    );

    return enemyDefeated;
  }, []);

  const resetForLevel = useCallback((level: number) => {
    setEnemies(generateEnemiesForLevel(level));
  }, []);

  return { enemies, damageEnemy, resetForLevel };
}
