import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { UploadService } from '../upload/upload.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly uploadService: UploadService,
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
          throw new BadRequestException(`Username chỉ được đổi 1 lần / 7 ngày. Còn ${daysLeft} ngày nữa.`);
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
}
