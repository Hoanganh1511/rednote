import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserEntity } from './user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return user;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserEntity> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Public()
  @Get('by-username/:username')
  @ApiOperation({ summary: 'Get user by username (public)' })
  async getUserByUsername(@Param('username') username: string): Promise<UserEntity> {
    return this.usersService.findByUsernamePublic(username);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (public)' })
  async getUser(@Param('id') id: string): Promise<UserEntity> {
    return this.usersService.findById(id);
  }

  @Post(':id/follow')
  @ApiOperation({ summary: 'Follow a user' })
  async followUser(
    @CurrentUser() user: UserEntity,
    @Param('id') followingId: string,
  ): Promise<{ isFollowing: boolean }> {
    await this.usersService.follow(user.id, followingId);
    return { isFollowing: true };
  }

  @Delete(':id/follow')
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollowUser(
    @CurrentUser() user: UserEntity,
    @Param('id') followingId: string,
  ): Promise<{ isFollowing: boolean }> {
    await this.usersService.unfollow(user.id, followingId);
    return { isFollowing: false };
  }

  @Public()
  @Get(':id/is-following')
  @ApiOperation({ summary: 'Check if current user is following another user' })
  async isFollowing(
    @CurrentUser() user: UserEntity | null,
    @Param('id') followingId: string,
  ): Promise<{ isFollowing: boolean }> {
    if (!user) return { isFollowing: false };
    const isFollowing = await this.usersService.isFollowing(user.id, followingId);
    return { isFollowing };
  }
}
