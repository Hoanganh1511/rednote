import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity, NotificationType } from './notification.entity';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import type { NotificationsGateway } from './notifications.gateway';

export interface CreateNotificationData {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    @Optional() private readonly gateway: NotificationsGateway | null,
  ) {}

  async createNotification(data: CreateNotificationData): Promise<void> {
    if (data.recipientId === data.actorId) return;

    const notification = this.notificationRepo.create({
      recipientId: data.recipientId,
      actorId: data.actorId,
      type: data.type,
      entityId: data.entityId ?? null,
      entityType: data.entityType ?? null,
      metadata: data.metadata ?? null,
      isRead: false,
    });

    const saved = await this.notificationRepo.save(notification);

    this.gateway?.emitToUser(data.recipientId, 'notification.new', {
      id: saved.id,
      type: saved.type,
    });
  }

  async getNotifications(
    userId: string,
    query: GetNotificationsDto,
  ): Promise<{ items: NotificationEntity[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.notificationRepo
      .createQueryBuilder('n')
      .leftJoin('n.actor', 'actor')
      .addSelect(['actor.id', 'actor.username', 'actor.displayName', 'actor.avatarUrl'])
      .where('n.recipientId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.type) {
      qb.andWhere('n.type = :type', { type: query.type });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async getUnreadCounts(userId: string): Promise<{
    LIKE_POST: number;
    NEW_FOLLOW: number;
    MENTION: number;
    total: number;
  }> {
    const rows = await this.notificationRepo
      .createQueryBuilder('n')
      .select('n.type', 'type')
      .addSelect('COUNT(n.id)::int', 'count')
      .where('n.recipientId = :userId', { userId })
      .andWhere('n.isRead = false')
      .groupBy('n.type')
      .getRawMany<{ type: NotificationType; count: number }>();

    const counts: Partial<Record<NotificationType, number>> = {};
    for (const row of rows) {
      counts[row.type] = Number(row.count);
    }

    return {
      LIKE_POST: counts[NotificationType.LIKE_POST] ?? 0,
      NEW_FOLLOW: counts[NotificationType.NEW_FOLLOW] ?? 0,
      MENTION: counts[NotificationType.MENTION] ?? 0,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    };
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, recipientId: userId },
    });
    if (!notification) throw new NotFoundException('Thông báo không tồn tại');
    await this.notificationRepo.update({ id: notificationId }, { isRead: true });
  }

  async markAllAsRead(userId: string, type?: NotificationType): Promise<void> {
    const qb = this.notificationRepo
      .createQueryBuilder()
      .update()
      .set({ isRead: true })
      .where('recipient_id = :userId', { userId })
      .andWhere('is_read = false');

    if (type) {
      qb.andWhere('type = :type', { type });
    }

    await qb.execute();
  }
}
