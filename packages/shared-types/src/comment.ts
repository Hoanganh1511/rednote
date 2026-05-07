export interface Comment {
  id: string;
  content: string;
  videoId: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  likeCount: number;
  replyCount: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  content: string;
  parentId?: string;
}
