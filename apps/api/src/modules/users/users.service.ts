import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
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

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.userRepo.update(id, { refreshToken });
  }
}
