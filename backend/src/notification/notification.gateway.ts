import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from './notification.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id;

      if (!userId) {
        client.disconnect();
        return;
      }

      // Join user room
      client.join(`user:${userId}`);

      // Track socket
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join role room
      client.join(`role:${payload.role}`);

      // Send unread count on connect
      const unreadCount = await this.notificationService.getUnreadCount(userId);
      client.emit('unreadCount', { count: unreadCount });

      console.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      console.error('Socket auth error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove from tracking
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(@ConnectedSocket() client: Socket, @MessageBody() data: { notificationId: number }) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id;

      await this.notificationService.markAsRead(userId, data.notificationId);
      const unreadCount = await this.notificationService.getUnreadCount(userId);
      client.emit('unreadCount', { count: unreadCount });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id;

      await this.notificationService.markAllAsRead(userId);
      client.emit('unreadCount', { count: 0 });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Method untuk dipanggil dari service lain
  async sendNotificationToUser(userId: number, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);

    // Update unread count
    const unreadCount = await this.notificationService.getUnreadCount(userId);
    this.server.to(`user:${userId}`).emit('unreadCount', { count: unreadCount });
  }

  async sendNotificationToRole(role: string, notification: any) {
    this.server.to(`role:${role}`).emit('notification', notification);
  }

  async sendOrderEventToSeller(tokoId: number, event: string, data: any) {
    // Cari userId dari tokoId
    const prisma = require('@prisma/client').PrismaClient;
    // Note: Dalam implementasi nyata, inject PrismaService
    this.server.to(`role:Seller`).emit('orderEvent', { event, data, tokoId });
  }
}