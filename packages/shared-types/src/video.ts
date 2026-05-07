export type VideoStatus = 'pending' | 'processing' | 'published' | 'failed' | 'deleted';

export interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  hlsUrl: string | null;
  duration: number;
  viewCount: number;
  likeCount: number;
  status: VideoStatus;
  tags: string[];
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VideoUploadPayload {
  title: string;
  description?: string;
  tags?: string[];
}
