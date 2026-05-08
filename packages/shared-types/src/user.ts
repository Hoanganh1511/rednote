export type UserRole = 'user' | 'creator' | 'admin';
export type UserGender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  username: string;
  email: string | null;
  phoneNumber: string | null;
  hasPassword: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  gender: UserGender | null;
  birthday: string | null;
  role: UserRole;
  followerCount: number;
  followingCount: number;
  videoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  isFollowing?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  displayName: string;
}
