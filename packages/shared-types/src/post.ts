/** Gói tác giả gắn feed (tránh lộ field nhạy cảm — API chỉ trả subset). */
export interface PostAuthorSnippet {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  gender?: 'male' | 'female' | null;
  age?: number | null;
}

export interface PostFeedItem {
  id: string;
  userId: string;
  content: string;
  imageUrls: string[];
  attachmentUrls: string[];
  hashtags: string[];
  locationText: string | null;
  status: 'draft' | 'published';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Số lượt thích (API public + Bearer tùy chọn). */
  likeCount?: number;
  /** Người xem (Bearer) đã thích hay chưa. */
  likedByMe?: boolean;
  /** Số bình luận (0 nếu chưa có bảng / chưa có bình luận). */
  commentCount?: number;
  user?: PostAuthorSnippet;
}

export interface PostFeedPage {
  items: PostFeedItem[];
  total: number;
}
