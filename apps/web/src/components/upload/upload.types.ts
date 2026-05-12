export type UploadTabId = 'short' | 'article' | 'library';

export interface UploadedVideo {
  id: string;
  file: File;
  name: string;
  size: number;
  duration?: number;
  thumbnail?: string;
  /** Hiển thị badge HDR (metadata hoặc tên file). */
  hdr?: boolean;
}

export interface VideoSettings {
  title: string;
  description: string;
  category: string;
  type: 'original' | 'repost';
  thumbnail?: string;
  selectedCoverFrameIndex: number;
  tags: string[];
  allowRemix: boolean;
  isDraft: boolean;
  scheduleTime?: Date;
  hashtags: string[];
  topics: string[];
  schedulePublish: boolean;
  commercialPromo: boolean;
  advancedOpen: boolean;
}
