import { IsIn } from 'class-validator';
import { POST_UPLOAD_ALLOWED_MIMES } from '../post-upload-mime';

export class PresignPostImageDto {
  @IsIn([...POST_UPLOAD_ALLOWED_MIMES])
  fileType: string;
}
