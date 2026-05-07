export type DanmakuMode = 'scroll' | 'top' | 'bottom';
export type DanmakuColor = string; // hex color

export interface Danmaku {
  id: string;
  content: string;
  time: number; // seconds in video
  color: DanmakuColor;
  mode: DanmakuMode;
  fontSize: number;
  videoId: string;
  authorId: string;
  createdAt: string;
}

export interface SendDanmakuPayload {
  content: string;
  time: number;
  color?: DanmakuColor;
  mode?: DanmakuMode;
  fontSize?: number;
}

export interface DanmakuSocketEvents {
  'danmaku:send': SendDanmakuPayload;
  'danmaku:receive': Danmaku;
  'danmaku:join': { videoId: string };
  'danmaku:leave': { videoId: string };
}
