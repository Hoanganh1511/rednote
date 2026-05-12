import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { PresignAvatarDto } from './dto/presign-avatar.dto';
import { PresignPostImageDto } from './dto/presign-post-image.dto';
import { DeletePostUploadsDto } from './dto/delete-post-uploads.dto';
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

  @Post('post-image/presign')
  @ApiOperation({ summary: 'Presign S3 cho ảnh post (JPEG/PNG/WebP/GIF) hoặc PDF' })
  async presignPostImage(
    @CurrentUser() user: UserEntity,
    @Body() dto: PresignPostImageDto,
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
    return this.uploadService.presignPostImage(user.id, dto.fileType);
  }

  @Post('post-assets/delete')
  @ApiOperation({
    summary: 'Xóa object S3 đã presign cho post (rollback khi tạo post lỗi)',
    description: 'Chỉ chấp nhận URL public trỏ tới key posts/{userId}/... của chính user.',
  })
  async deletePostUploads(
    @CurrentUser() user: UserEntity,
    @Body() dto: DeletePostUploadsDto,
  ): Promise<{ deleted: number; skipped: number }> {
    return this.uploadService.deletePostUploadUrls(user.id, dto.urls);
  }
}
