import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

/** Chỉ `page`: mỗi trang luôn 6 bài (xem `posts.service` + `posts.constants`). */
export class ListFeedPostsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
