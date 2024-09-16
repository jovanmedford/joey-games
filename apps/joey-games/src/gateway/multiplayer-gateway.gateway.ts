import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientConnectedEvent, ClientDisconnectedEvent } from '../lib/utils';
import { Socket, Server } from 'socket.io';
import { RoomGuard } from '../guards/room.guard';
import { GatewayGuard } from '../guards/gateway.guard';

@UseGuards(GatewayGuard)
@WebSocketGateway()
export class MultiplayerGatewayGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MultiplayerGatewayGateway.name);

  constructor(private eventEmitter: EventEmitter2) {}

  afterInit() {
    this.logger.log('Gateway started...');
  }

  handleConnection(client: any) {
    this.logger.debug(
      `Number of sockets connected: ${this.server.sockets.sockets.size}`
    );
    this.eventEmitter.emit(
      'client.connected',
      new ClientConnectedEvent({
        client,
      })
    );
  }

  handleDisconnect(client) {
    this.logger.log(
      `DISCONNECTED. Number of sockets connected: ${this.server.sockets.sockets.size}`
    );
    this.eventEmitter.emit(
      'client.disconnected',
      new ClientDisconnectedEvent({
        client,
      })
    );
  }

  @SubscribeMessage('connection_error')
  handleConnectionError(@MessageBody() data: string) {
    this.logger.debug(data);
  }

  @SubscribeMessage('ping')
  handlePing(client: any, data: string): WsResponse<string> {
    return { event: 'pong', data: data };
  }

  @SubscribeMessage('create_room')
  handleRoomCreated(socket: Socket) {
    this.logger.log(`Create: ${socket.id}`);
  }

  @UseGuards(RoomGuard)
  @SubscribeMessage('join_room')
  handleJoinRoom(socket: Socket) {
    this.logger.log(`Join: ${socket.id}`);
  }
}
