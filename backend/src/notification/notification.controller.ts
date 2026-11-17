import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Notification')
@Controller('notification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAll(@Request() req, @Query('unreadOnly') unreadOnly?: string) {
    return this.notificationService.getUserNotifications(
      req.user.sub,
      unreadOnly === 'true',
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.notificationService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    const result = await this.notificationService.markAllAsRead(req.user.sub);
    return {
      message: 'Semua notifikasi ditandai dibaca',
      updated: result.count,
    };
  }

  @Patch(':id/read')
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.notificationService.markAsRead(req.user.sub, +id);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.notificationService.deleteNotification(req.user.sub, +id);
    return { message: 'Notifikasi dihapus' };
  }
}
