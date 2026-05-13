import { Column, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('follows')
@Index(['followerId', 'deletedAt'])
@Index(['followingId', 'deletedAt'])
@Index(['followerId', 'followingId'], { unique: true })
export class FollowEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'follower_id', type: 'uuid' })
  followerId: string;

  @Column({ name: 'following_id', type: 'uuid' })
  followingId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  follower: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  following: UserEntity;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
