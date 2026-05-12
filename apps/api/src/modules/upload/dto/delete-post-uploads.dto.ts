import { ArrayMaxSize, ArrayUnique, IsArray, IsUrl } from 'class-validator';

export class DeletePostUploadsDto {
  @IsArray()
  @ArrayMaxSize(15)
  @ArrayUnique()
  @IsUrl({}, { each: true })
  urls: string[];
}
