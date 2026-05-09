import { Exclude } from 'class-transformer';
import { AfterLoad, Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export type UserRole = 'user' | 'creator' | 'admin';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ unique: true })
  username: string;

  @Index({ unique: true, sparse: true })
  @Column({ type: 'varchar', unique: true, nullable: true, default: null })
  email: string | null;

  @Exclude()
  @Column({ name: 'password_hash', type: 'varchar', nullable: true, default: null })
  passwordHash: string | null;

  @Column({ name: 'display_name', type: 'varchar', nullable: true, default: null })
  displayName: string | null;

  @Column({ name: 'avatar_url', nullable: true, type: 'text' })
  avatarUrl: string | null;

  @Column({ nullable: true, type: 'text' })
  bio: string | null;

  @Column({ type: 'enum', enum: ['user', 'creator', 'admin'], default: 'user' })
  role: UserRole;

  @Column({ name: 'follower_count', default: 0 })
  followerCount: number;

  @Column({ name: 'following_count', default: 0 })
  followingCount: number;

  @Column({ name: 'video_count', default: 0 })
  videoCount: number;

  @Index({ unique: true, sparse: true })
  @Column({ name: 'phone_number', nullable: true, unique: true, type: 'varchar', length: 20 })
  phoneNumber: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, default: null })
  gender: 'male' | 'female' | 'other' | null;

  @Column({ type: 'date', nullable: true, default: null })
  birthday: string | null;

  @Column({ name: 'username_changed_at', type: 'timestamptz', nullable: true, default: null })
  usernameChangedAt: Date | null;

  @Exclude()
  @Column({ name: 'refresh_token', nullable: true, type: 'text' })
  refreshToken: string | null;

  hasPassword!: boolean;

  @AfterLoad()
  computeHasPassword() {
    this.hasPassword = this.passwordHash !== null;
  }
}
