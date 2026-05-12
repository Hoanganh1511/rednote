import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from '../users/user.entity';

export type PostStatus = 'draft' | 'published';

@Entity('posts')
export class PostEntity extends BaseEntity {
  @Index('idx_posts_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'text', default: '' })
  content: string;

  @Column({ name: 'image_urls', type: 'text', array: true, default: '{}' })
  imageUrls: string[];

  @Column({ name: 'attachment_urls', type: 'text', array: true, default: '{}' })
  attachmentUrls: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  hashtags: string[];

  @Column({ name: 'location_text', type: 'varchar', length: 120, nullable: true, default: null })
  locationText: string | null;

  @Index('idx_posts_status')
  @Column({ type: 'enum', enum: ['draft', 'published'], default: 'published' })
  status: PostStatus;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true, default: null })
  publishedAt: Date | null;
}

