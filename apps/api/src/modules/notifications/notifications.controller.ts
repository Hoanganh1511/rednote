import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/user.entity';
import { NotificationType } from './notification.entity';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo' })
  async getNotifications(
    @CurrentUser() user: UserEntity,
    @Query() query: GetNotificationsDto,
  ) {
    const { items, total } = await this.notificationsService.getNotifications(user.id, query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      items,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Lấy số thông báo chưa đọc theo loại' })
  async getUnreadCount(@CurrentUser() user: UserEntity) {
    return this.notificationsService.getUnreadCounts(user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả đã đọc (có thể lọc theo type)' })
  async markAllAsRead(
    @CurrentUser() user: UserEntity,
    @Query('type') type?: NotificationType,
  ) {
    await this.notificationsService.markAllAsRead(user.id, type);
    return { success: true };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu một thông báo đã đọc' })
  async markAsRead(@CurrentUser() user: UserEntity, @Param('id') id: string) {
    await this.notificationsService.markAsRead(user.id, id);
    return { success: true };
  }
}
