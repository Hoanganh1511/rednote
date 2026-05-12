import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { PostEntity } from './post.entity';
import { UserEntity } from '../users/user.entity';

@Entity('post_likes')
@Unique('uq_post_likes_post_user', ['postId', 'userId'])
export class PostLikeEntity extends BaseEntity {
  @Column({ name: 'post_id', type: 'uuid' })
  postId: string;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
