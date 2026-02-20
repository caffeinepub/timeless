import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGameState(playerId: bigint) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const gameStateQuery = useQuery({
    queryKey: ['gameState', playerId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getGameState(playerId);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: false,
    staleTime: Infinity,
  });

  const startGameMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.startGame(playerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameState', playerId.toString()] });
    },
  });

  const takeDamageMutation = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.takeDamage(playerId, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameState', playerId.toString()] });
    },
  });

  const defeatEnemyMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.defeatEnemy(playerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameState', playerId.toString()] });
    },
  });

  const increaseScoreMutation = useMutation({
    mutationFn: async (points: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.increaseScore(playerId, points);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameState', playerId.toString()] });
    },
  });

  const rechargeWeaponMutation = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.rechargeWeapon(playerId, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameState', playerId.toString()] });
    },
  });

  return {
    gameState: gameStateQuery.data,
    isLoading: gameStateQuery.isLoading,
    startGame: startGameMutation.mutate,
    takeDamage: takeDamageMutation.mutate,
    defeatEnemy: defeatEnemyMutation.mutate,
    increaseScore: increaseScoreMutation.mutate,
    rechargeWeapon: rechargeWeaponMutation.mutate,
  };
}
