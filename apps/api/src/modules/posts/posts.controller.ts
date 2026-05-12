import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserEntity } from '../users/user.entity';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ListMyPostsDto } from './dto/list-my-posts.dto';
import { ListFeedPostsDto } from './dto/list-feed-posts.dto';
import { PostEntity } from './post.entity';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user posts' })
  getMyPosts(
    @CurrentUser() user: UserEntity,
    @Query() query: ListMyPostsDto,
  ): Promise<{ items: PostEntity[]; total: number }> {
    return this.postsService.getMyPosts(user.id, query);
  }

  @Public()
  @Get('feed')
  @ApiOperation({ summary: 'Feed bài post đã xuất bản (trang chủ)' })
  getPublishedFeed(
    @Query() query: ListFeedPostsDto,
    @Req() req: FastifyRequest,
  ): Promise<{ items: PostEntity[]; total: number }> {
    const viewerId = this.postsService.tryViewerUserIdFromAuthHeader(req.headers.authorization);
    return this.postsService.getPublishedFeed(query, viewerId);
  }

  @Public()
  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Get published posts by user (public)' })
  getUserPublishedPosts(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
    @Req() req: FastifyRequest,
  ): Promise<{ items: PostEntity[]; total: number }> {
    const viewerId = this.postsService.tryViewerUserIdFromAuthHeader(req.headers.authorization);
    return this.postsService.getUserPublishedPosts(userId, page, limit, viewerId);
  }

  @Public()
  @Get(':id/comments')
  @ApiOperation({ summary: 'Danh sách bình luận post (stub — sẽ thay bằng DB)' })
  getPublishedPostComments(@Param('id', ParseUUIDPipe) id: string): Promise<{ items: unknown[]; total: number }> {
    return this.postsService.getPublishedPostComments(id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết post đã xuất bản' })
  getPublishedPost(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: FastifyRequest,
  ): Promise<PostEntity> {
    const viewerId = this.postsService.tryViewerUserIdFromAuthHeader(req.headers.authorization);
    return this.postsService.getPublishedPostById(id, viewerId);
  }

  @Post()
  @ApiOperation({ summary: 'Create post/draft' })
  createPost(@CurrentUser() user: UserEntity, @Body() dto: CreatePostDto): Promise<PostEntity> {
    return this.postsService.createPost(user.id, dto);
  }

  @Post(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thích / bỏ thích bài (toggle)' })
  togglePostLike(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    return this.postsService.togglePostLike(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update post/draft' })
  updatePost(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.updatePost(user.id, id, dto);
  }
}
