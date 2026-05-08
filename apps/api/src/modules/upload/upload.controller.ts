import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { PresignAvatarDto } from './dto/presign-avatar.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserEntity } from '../users/user.entity';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar/presign')
  @ApiOperation({ summary: 'Get presigned S3 URL for avatar upload' })
  async presignAvatar(
    @CurrentUser() user: UserEntity,
    @Body() dto: PresignAvatarDto,
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
    return this.uploadService.presignAvatar(user.id, dto.fileType);
  }
}
