import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, In, IsNull, Repository, DataSource } from 'typeorm';
import { PostEntity } from './post.entity';
import { PostLikeEntity } from './post-like.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ListMyPostsDto } from './dto/list-my-posts.dto';
import { ListFeedPostsDto } from './dto/list-feed-posts.dto';
import { UserEntity } from '../users/user.entity';
import { FollowEntity } from '../users/follow.entity';
import { POSTS_FEED_PAGE_SIZE } from './posts.constants';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(PostLikeEntity)
    private readonly postLikeRepo: Repository<PostLikeEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepo: Repository<FollowEntity>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  private calculateAge(birthday: string | null): number | null {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  }

  private enrichPostWithAuthorAge(post: PostEntity): PostEntity {
    if (post.user) {
      (post as any).user = {
        id: post.user.id,
        username: post.user.username,
        displayName: post.user.displayName,
        avatarUrl: post.user.avatarUrl,
        gender: post.user.gender,
        age: this.calculateAge(post.user.birthday),
      };
    }
    return post;
  }

  /** JWT hợp lệ (Bearer) → `sub` user; sai/missing → null — dùng cho route @Public có meta thích. */
  tryViewerUserIdFromAuthHeader(authorization?: string | string[]): string | null {
    const raw = Array.isArray(authorization) ? authorization[0] : authorization;
    if (!raw?.startsWith('Bearer ')) return null;
    const token = raw.slice(7).trim();
    if (!token) return null;
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      return typeof payload.sub === 'string' ? payload.sub : null;
    } catch {
      return null;
    }
  }

  private normalizeHashtags(raw: string[]): string[] {
    return raw
      .map((tag) =>
        tag
          .replace(/^#/, '')
          .trim()
          .replace(/\s+/g, '_')
          .replace(/[^\p{L}\p{N}_-]/gu, '')
          .slice(0, 24),
      )
      .filter(Boolean)
      .filter((tag, idx, arr) => arr.findIndex((x) => x.toLowerCase() === tag.toLowerCase()) === idx);
  }

  private normalizeStoredContent(raw: string): string {
    return (raw ?? '').replace(/\r\n/g, '\n');
  }

  private validateContentShape(content: string, imageUrls: string[], attachmentUrls: string[]) {
    const hasText = content.trim().length > 0;
    const hasImage = imageUrls.length > 0;
    const hasFile = attachmentUrls.length > 0;
    if (!hasText && !hasImage && !hasFile) {
      throw new BadRequestException('Post cần ít nhất nội dung, 1 ảnh hoặc 1 file đính kèm.');
    }
  }

  async createPost(userId: string, dto: CreatePostDto): Promise<PostEntity> {
    const hashtags = this.normalizeHashtags(dto.hashtags ?? []);
    const contentRaw = this.normalizeStoredContent(dto.content ?? '');
    const imageUrls = dto.imageUrls ?? [];
    const attachmentUrls = dto.attachmentUrls ?? [];
    this.validateContentShape(contentRaw, imageUrls, attachmentUrls);

    const status = dto.status ?? 'published';
    const post = this.postRepo.create({
      userId,
      content: contentRaw,
      imageUrls,
      attachmentUrls,
      hashtags,
      locationText: dto.locationText?.trim() || null,
      status,
      publishedAt: status === 'published' ? new Date() : null,
    });
    return this.savePostHandlingDbMismatch(post);
  }

  async updatePost(userId: string, postId: string, dto: UpdatePostDto): Promise<PostEntity> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post không tồn tại.');
    if (post.userId !== userId) throw new ForbiddenException('Bạn không có quyền sửa post này.');

    const nextContent =
      dto.content !== undefined ? this.normalizeStoredContent(dto.content) : post.content;
    const nextImages = dto.imageUrls !== undefined ? dto.imageUrls : post.imageUrls;
    const nextAttachments =
      dto.attachmentUrls !== undefined ? dto.attachmentUrls : post.attachmentUrls;
    const nextHashtags = dto.hashtags !== undefined ? this.normalizeHashtags(dto.hashtags) : post.hashtags;
    const nextStatus = dto.status ?? post.status;

    this.validateContentShape(nextContent, nextImages, nextAttachments);

    post.content = nextContent;
    post.imageUrls = nextImages;
    post.attachmentUrls = nextAttachments;
    post.hashtags = nextHashtags;
    post.locationText = dto.locationText !== undefined ? dto.locationText?.trim() || null : post.locationText;
    post.status = nextStatus;
    post.publishedAt = nextStatus === 'published' ? post.publishedAt ?? new Date() : null;

    return this.savePostHandlingDbMismatch(post);
  }

  /** Bắt lỗi PG thiếu cột (migration chưa chạy) thay vì 500 mơ hồ. */
  private async savePostHandlingDbMismatch(post: PostEntity): Promise<PostEntity> {
    try {
      return await this.postRepo.save(post);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const driver = err.driverError as { code?: string; message?: string } | undefined;
        const code = driver?.code;
        const msg = `${err.message} ${driver?.message ?? ''}`;
        this.logger.error(`posts save QueryFailedError code=${code} message=${msg}`);
        if (
          code === '42703' ||
          msg.includes('attachment_urls') ||
          (msg.includes('column') && msg.includes('does not exist'))
        ) {
          throw new BadRequestException(
            'Cấu trúc database chưa khớp code (thiếu cột, v.v.). Chạy: pnpm --filter api migration:run',
          );
        }
      }
      throw err;
    }
  }

  async getMyPosts(userId: string, query: ListMyPostsDto): Promise<{ items: PostEntity[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = query.status ? { userId, status: query.status } : { userId };

    const [items, total] = await this.postRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  private async attachLikeMeta(items: PostEntity[], viewerUserId: string | null): Promise<void> {
    if (items.length === 0) return;
    const ids = items.map((p) => p.id);

    const countRows = await this.postLikeRepo
      .createQueryBuilder('pl')
      .select('pl.postId', 'postId')
      .addSelect('COUNT(pl.id)::int', 'cnt')
      .where('pl.postId IN (:...ids)', { ids })
      .groupBy('pl.postId')
      .getRawMany<{ postId: string; cnt: number }>();

    const countMap = new Map<string, number>();
    for (const r of countRows) {
      countMap.set(r.postId, Number(r.cnt));
    }

    let likedSet = new Set<string>();
    if (viewerUserId) {
      const mine = await this.postLikeRepo.find({
        where: { userId: viewerUserId, postId: In(ids) },
        select: ['postId'],
      });
      likedSet = new Set(mine.map((m) => m.postId));
    }

    for (const p of items) {
      const ext = p as PostEntity & { likeCount: number; likedByMe: boolean };
      ext.likeCount = countMap.get(p.id) ?? 0;
      ext.likedByMe = viewerUserId ? likedSet.has(p.id) : false;
    }
  }

  /** Số bình luận — stub 0 cho tới khi có bảng comment + query thật. */
  private attachCommentCountMeta(items: PostEntity[]): void {
    for (const p of items) {
      (p as PostEntity & { commentCount: number }).commentCount = 0;
    }
  }

  /** Attach whether viewer is following each post's author. */
  private async attachFollowingAuthorMeta(items: PostEntity[], viewerUserId: string | null): Promise<void> {
    if (items.length === 0 || !viewerUserId) {
      for (const p of items) {
        (p as PostEntity & { isFollowingAuthor: boolean }).isFollowingAuthor = false;
      }
      return;
    }

    const authorIds = [...new Set(items.map((p) => p.userId))];
    const followingRows = await this.followRepo.find({
      where: {
        followerId: viewerUserId,
        followingId: In(authorIds),
        deletedAt: IsNull(),
      },
    });

    const followingSet = new Set(followingRows.map((f) => f.followingId));

    for (const p of items) {
      (p as PostEntity & { isFollowingAuthor: boolean }).isFollowingAuthor = followingSet.has(p.userId);
    }
  }

  /** Feed trang chủ: bài đã xuất bản, mới nhất trước (`createdAt DESC`), phân trang cố định 6/trang. */
  async getPublishedFeed(
    query: ListFeedPostsDto,
    viewerUserId: string | null,
  ): Promise<{ items: PostEntity[]; total: number }> {
    const page = query.page ?? 1;
    const limit = POSTS_FEED_PAGE_SIZE;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.status = :st', { st: 'published' })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    let items: PostEntity[];
    let total: number;
    try {
      [items, total] = await qb.getManyAndCount();
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const driver = err.driverError as { code?: string; message?: string } | undefined;
        const msg = `${err.message} ${driver?.message ?? ''}`;
        this.logger.error(`posts feed QueryFailedError code=${driver?.code} ${msg}`);
        if (
          driver?.code === '42703' ||
          msg.includes('does not exist') ||
          (msg.includes('column') && msg.includes('posts'))
        ) {
          throw new BadRequestException(
            'Cấu trúc database chưa khớp code (thiếu cột). Chạy: pnpm --filter api migration:run',
          );
        }
      }
      throw err;
    }
    await this.attachLikeMeta(items, viewerUserId);
    await this.attachFollowingAuthorMeta(items, viewerUserId);
    this.attachCommentCountMeta(items);
    items.forEach((item) => this.enrichPostWithAuthorAge(item));
    return { items, total };
  }

  /** User profile posts: published posts by userId, newest first, 6 per page. */
  async getUserPublishedPosts(
    userId: string,
    page: number = 1,
    limit: number = 6,
    viewerUserId: string | null = null,
  ): Promise<{ items: PostEntity[]; total: number }> {
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.userId = :userId', { userId })
      .andWhere('post.status = :st', { st: 'published' })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    let items: PostEntity[];
    let total: number;
    try {
      [items, total] = await qb.getManyAndCount();
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const driver = err.driverError as { code?: string; message?: string } | undefined;
        const msg = `${err.message} ${driver?.message ?? ''}`;
        this.logger.error(`user posts QueryFailedError code=${driver?.code} ${msg}`);
        if (
          driver?.code === '42703' ||
          msg.includes('does not exist') ||
          (msg.includes('column') && msg.includes('posts'))
        ) {
          throw new BadRequestException(
            'Cấu trúc database chưa khớp code (thiếu cột). Chạy: pnpm --filter api migration:run',
          );
        }
      }
      throw err;
    }
    await this.attachLikeMeta(items, viewerUserId);
    await this.attachFollowingAuthorMeta(items, viewerUserId);
    this.attachCommentCountMeta(items);
    items.forEach((item) => this.enrichPostWithAuthorAge(item));
    return { items, total };
  }

  async getPublishedPostById(id: string, viewerUserId: string | null): Promise<PostEntity> {
    const post = await this.postRepo.findOne({
      where: { id, status: 'published' },
      relations: ['user'],
    });
    if (!post) {
      throw new NotFoundException('Post không tồn tại.');
    }
    await this.attachLikeMeta([post], viewerUserId);
    await this.attachFollowingAuthorMeta([post], viewerUserId);
    this.attachCommentCountMeta([post]);
    this.enrichPostWithAuthorAge(post);
    return post;
  }

  /** Stub: sau này join bảng comments + paging. */
  async getPublishedPostComments(postId: string): Promise<{ items: unknown[]; total: number }> {
    await this.getPublishedPostById(postId, null);
    return { items: [], total: 0 };
  }

  /** Toggle like (một user một lượt thích / gỡ). */
  async togglePostLike(userId: string, postId: string): Promise<{ liked: boolean; likeCount: number }> {
    const post = await this.getPublishedPostById(postId, null);
    const authorId = post.userId;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(PostLikeEntity, {
        where: { postId, userId },
      });

      const isLiking = !existing;

      if (existing) {
        await queryRunner.manager.remove(PostLikeEntity, existing);
        // Decrement counters
        await queryRunner.manager
          .createQueryBuilder()
          .update(PostEntity)
          .set({ likeCount: () => 'like_count - 1' })
          .where('id = :id', { id: postId })
          .execute();
        await queryRunner.manager
          .createQueryBuilder()
          .update(UserEntity)
          .set({ totalLikesReceived: () => 'total_likes_received - 1' })
          .where('id = :id', { id: authorId })
          .execute();
      } else {
        const like = queryRunner.manager.create(PostLikeEntity, { postId, userId });
        await queryRunner.manager.save(PostLikeEntity, like);
        // Increment counters
        await queryRunner.manager
          .createQueryBuilder()
          .update(PostEntity)
          .set({ likeCount: () => 'like_count + 1' })
          .where('id = :id', { id: postId })
          .execute();
        await queryRunner.manager
          .createQueryBuilder()
          .update(UserEntity)
          .set({ totalLikesReceived: () => 'total_likes_received + 1' })
          .where('id = :id', { id: authorId })
          .execute();
      }

      await queryRunner.commitTransaction();

      const likeCount = await this.postLikeRepo.count({ where: { postId } });
      return { liked: isLiking, likeCount };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getPostLikers(
    postId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: Partial<UserEntity>[]; total: number }> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post không tìm thấy');
    }

    const skip = (page - 1) * limit;

    const [likers, total] = await this.postLikeRepo.findAndCount({
      where: { postId },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items: likers.map((like) => like.user),
      total,
    };
  }
}
