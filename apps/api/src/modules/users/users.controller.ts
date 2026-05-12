import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
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
}
