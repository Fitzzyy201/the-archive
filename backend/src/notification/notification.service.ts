import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNotificationDto {
  userId: number;
  tipe: string;
  title: string;
  message: string;
  link?: string;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notifikasi.create({
      data: {
        userId: dto.userId,
        tipe: dto.tipe,
        title: dto.title,
        message: dto.message,
        link: dto.link,
      },
    });
  }

  async getUserNotifications(userId: number, unreadOnly = false) {
    return this.prisma.notifikasi.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(userId: number, notificationId: number) {
    return this.prisma.notifikasi.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notifikasi.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: number) {
    return this.prisma.notifikasi.count({
      where: { userId, isRead: false },
    });
  }

  async deleteNotification(userId: number, notificationId: number) {
    return this.prisma.notifikasi.delete({
      where: { id: notificationId, userId },
    });
  }
}