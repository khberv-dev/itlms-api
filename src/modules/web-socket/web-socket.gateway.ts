import {
  ConnectedSocket,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@WebSocketGateway()
export class WebGateway implements OnGatewayInit {
  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  @WebSocketServer()
  server: Server;

  async afterInit(server: Server) {
    console.log('WebSocket server initialized!');
    await this.cacheService.set(`online`, []);
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    await this.cacheService.set(`socket${client.handshake.query.userId}`, client.id);
    this.server.to(client.id).emit('message', 'you connected successfully');
  }

  async handleDisconnect(client: any) {
    await this.cacheService.del(`socket${client.handshake.query.userId}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
  }

  async handleNewSale(data) {
    this.server.emit('new-sale', data);
  }
}
