import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    defeatEnemy(playerId: bigint): Promise<void>;
    getGameState(playerId: bigint): Promise<{
        enemiesDefeated: bigint;
        score: bigint;
        ammunition: bigint;
        health: bigint;
    }>;
    increaseScore(playerId: bigint, points: bigint): Promise<void>;
    rechargeWeapon(playerId: bigint, amount: bigint): Promise<void>;
    startGame(playerId: bigint): Promise<void>;
    takeDamage(playerId: bigint, amount: bigint): Promise<void>;
}
