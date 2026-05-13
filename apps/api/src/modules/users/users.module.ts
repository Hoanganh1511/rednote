import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { FollowEntity } from './follow.entity';
import { PostEntity } from '../posts/post.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowEntity, PostEntity]), UploadModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
