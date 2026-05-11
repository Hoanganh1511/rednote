export interface UploadedVideo {
  id: string;
  file: File;
  name: string;
  size: number;
  duration?: number;
  thumbnail?: string;
}

export interface VideoSettings {
  title: string;
  description: string;
  category: string;
  type: 'original' | 'repost';
  thumbnail?: string;
  tags: string[];
  allowRemix: boolean;
  isDraft: boolean;
  scheduleTime?: Date;
  hashtags: string[];
}
