import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { UserEntity } from './user.entity';
import { FollowEntity } from './follow.entity';
import { UploadService } from '../upload/upload.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepo: Repository<FollowEntity>,
    private readonly uploadService: UploadService,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async findByUsernamePublic(username: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  async findByPhone(phoneNumber: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { phoneNumber } });
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserEntity> {
    const current = await this.findById(id);

    if (dto.username && dto.username !== current.username) {
      const taken = await this.userRepo.findOne({ where: { username: dto.username } });
      if (taken) throw new ConflictException('Username đã được sử dụng');

      if (current.usernameChangedAt) {
        const msElapsed = Date.now() - current.usernameChangedAt.getTime();
        const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);
        if (daysElapsed < 7) {
          const daysLeft = Math.ceil(7 - daysElapsed);
          throw new BadRequestException(
            `Username chỉ được đổi 1 lần / 7 ngày. Còn ${daysLeft} ngày nữa.`,
          );
        }
      }
    }

    const patch: Partial<UserEntity> = {};
    if (dto.displayName !== undefined) patch.displayName = dto.displayName;
    if (dto.bio !== undefined) patch.bio = dto.bio;
    if (dto.gender !== undefined) patch.gender = dto.gender;
    if (dto.birthday !== undefined) patch.birthday = dto.birthday ?? null;
    if (dto.avatarUrl !== undefined) {
      if (current.avatarUrl && current.avatarUrl !== dto.avatarUrl) {
        this.uploadService.deleteByUrl(current.avatarUrl);
      }
      patch.avatarUrl = dto.avatarUrl;
    }
    if (dto.username !== undefined && dto.username !== current.username) {
      patch.username = dto.username;
      patch.usernameChangedAt = new Date();
    }

    await this.userRepo.update(id, patch);
    return this.findById(id);
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.userRepo.update(id, { refreshToken });
  }

  async saveEmail(id: string, email: string): Promise<void> {
    await this.userRepo.update(id, { email });
  }

  async savePhone(id: string, phoneNumber: string): Promise<void> {
    await this.userRepo.update(id, { phoneNumber });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.userRepo.update(id, { passwordHash });
  }

  async findByPasswordResetToken(token: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { passwordResetToken: token } });
  }

  async setPasswordResetToken(id: string, token: string, expiresAt: Date): Promise<void> {
    await this.userRepo.update(id, {
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt,
    });
  }

  async clearPasswordResetToken(id: string): Promise<void> {
    await this.userRepo.update(id, { passwordResetToken: null, passwordResetExpiresAt: null });
  }

  async follow(followerId: string, followingId: string): Promise<void> {
    console.log(9999, { followerId, followingId });
    if (followerId === followingId) {
      throw new BadRequestException('Không thể theo dõi chính mình');
    }

    // Check if both users exist
    await Promise.all([this.findById(followerId), this.findById(followingId)]);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if already following
      const existing = await queryRunner.manager.findOne(FollowEntity, {
        where: { followerId, followingId, deletedAt: IsNull() },
      });

      if (existing) {
        await queryRunner.rollbackTransaction();
        return; // Already following, idempotent
      }

      // Check soft-deleted follow
      const softDeleted = await queryRunner.manager.findOne(FollowEntity, {
        where: { followerId, followingId },
      });

      if (softDeleted) {
        // Restore soft-deleted follow
        await queryRunner.manager.update(FollowEntity, { id: softDeleted.id }, { deletedAt: null });
      } else {
        // Create new follow
        const follow = queryRunner.manager.create(FollowEntity, {
          followerId,
          followingId,
        });
        await queryRunner.manager.save(follow);
      }

      // Update counters atomically
      await queryRunner.manager.update(
        UserEntity,
        { id: followerId },
        { followingCount: () => 'following_count + 1' },
      );
      await queryRunner.manager.update(
        UserEntity,
        { id: followingId },
        { followerCount: () => 'follower_count + 1' },
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const follow = await queryRunner.manager.findOne(FollowEntity, {
        where: { followerId, followingId, deletedAt: IsNull() },
      });

      if (!follow) {
        await queryRunner.rollbackTransaction();
        return; // Not following, idempotent
      }

      // Soft delete
      await queryRunner.manager.update(FollowEntity, { id: follow.id }, { deletedAt: new Date() });

      // Update counters atomically
      await queryRunner.manager.update(
        UserEntity,
        { id: followerId },
        { followingCount: () => 'following_count - 1' },
      );
      await queryRunner.manager.update(
        UserEntity,
        { id: followingId },
        { followerCount: () => 'follower_count - 1' },
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    console.log('🔍 isFollowing query:', { followerId, followingId });
    const follow = await this.followRepo.findOne({
      where: { followerId, followingId, deletedAt: IsNull() },
    });
    console.log('🔍 isFollowing result:', follow ? 'found' : 'not found', follow);
    return !!follow;
  }
}
