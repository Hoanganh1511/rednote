import { Body, Controller, Delete, Get, Header, Param, Patch, Post } from '@nestjs/common';
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
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
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
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Get user by username (public)' })
  async getUserByUsername(@Param('username') username: string): Promise<UserEntity> {
    return this.usersService.findByUsernamePublic(username);
  }

  @Get(':id')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Get user by ID (public)' })
  async getUser(@Param('id') id: string): Promise<UserEntity> {
    return this.usersService.findById(id);
  }

  @Post(':id/follow')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Follow a user' })
  async followUser(
    @CurrentUser() user: UserEntity,
    @Param('id') followingId: string,
  ): Promise<{ isFollowing: boolean }> {
    await this.usersService.follow(user.id, followingId);
    return { isFollowing: true };
  }

  @Delete(':id/follow')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollowUser(
    @CurrentUser() user: UserEntity,
    @Param('id') followingId: string,
  ): Promise<{ isFollowing: boolean }> {
    await this.usersService.unfollow(user.id, followingId);
    return { isFollowing: false };
  }

  @Get(':id/is-following')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Check if current user is following another user' })
  async isFollowing(
    @CurrentUser() user: UserEntity,
    @Param('id') followingId: string,
  ): Promise<{ isFollowing: boolean }> {
    const isFollowing = await this.usersService.isFollowing(user.id, followingId);
    return { isFollowing };
  }

  @Public()
  @Get(':id/followers')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Get list of followers for a user (public)' })
  async getFollowers(@Param('id') userId: string): Promise<{ items: UserEntity[] }> {
    const followers = await this.usersService.getFollowers(userId);
    return { items: followers };
  }

  @Public()
  @Get(':id/following')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Get list of users that a user is following (public)' })
  async getFollowing(@Param('id') userId: string): Promise<{ items: UserEntity[] }> {
    const following = await this.usersService.getFollowing(userId);
    return { items: following };
  }

  @Post(':id/sync-likes')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Sync total likes received count (admin only)' })
  async syncLikes(@Param('id') userId: string): Promise<{ totalLikesReceived: number }> {
    const totalLikesReceived = await this.usersService.syncTotalLikesReceived(userId);
    return { totalLikesReceived };
  }
}
