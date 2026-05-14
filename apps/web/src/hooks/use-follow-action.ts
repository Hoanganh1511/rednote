import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useFollowAction() {
  const queryClient = useQueryClient();

  const follow = useCallback(
    async (userId: string) => {
      await apiClient.post(`/users/${userId}/follow`);
      // Invalidate user query to refetch updated follower count
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    [queryClient],
  );

  const unfollow = useCallback(
    async (userId: string) => {
      await apiClient.delete(`/users/${userId}/follow`);
      // Invalidate user query to refetch updated follower count
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    [queryClient],
  );

  return { follow, unfollow };
}
