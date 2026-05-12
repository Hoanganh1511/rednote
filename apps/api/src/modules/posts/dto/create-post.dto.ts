import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(1000)
  content: string;

  @IsArray()
  @ArrayMaxSize(9)
  @ArrayUnique()
  @IsUrl({}, { each: true })
  imageUrls: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ArrayUnique()
  @IsUrl({}, { each: true })
  attachmentUrls?: string[];

  @IsArray()
  @ArrayMaxSize(12)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(24, { each: true })
  hashtags: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationText?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';
}

