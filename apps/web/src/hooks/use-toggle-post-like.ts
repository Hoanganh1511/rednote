'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export type PostLikeToggleResult = { liked: boolean; likeCount: number };

export function useTogglePostLike(postId: string) {
  return useMutation({
    mutationKey: ['post-like-toggle', postId],
    mutationFn: async () => {
      const res = await apiClient.post<PostLikeToggleResult>(`/posts/${postId}/like`, {});
      return res.data as PostLikeToggleResult;
    },
  });
}
