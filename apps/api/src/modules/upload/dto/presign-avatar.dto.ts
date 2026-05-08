import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

export class PresignAvatarDto {
  @ApiProperty({ enum: ALLOWED_TYPES, example: 'image/jpeg' })
  @IsString()
  @IsIn(ALLOWED_TYPES, { message: 'Chỉ hỗ trợ JPG, PNG, WebP, GIF' })
  fileType: AllowedType;

  @ApiProperty({ example: 512000, description: 'Kích thước file (bytes), tối đa 2MB' })
  @IsInt()
  @Min(1)
  @Max(2 * 1024 * 1024, { message: 'Ảnh không được vượt quá 2MB' })
  fileSize: number;
}
