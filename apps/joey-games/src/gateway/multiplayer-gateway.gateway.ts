import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientConnectedEvent, ClientDisconnectedEvent } from '../lib/utils';
import { Socket } from 'socket.io-client';

@WebSocketGateway()
export class MultiplayerGatewayGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MultiplayerGatewayGateway.name);

  constructor(private eventEmitter: EventEmitter2) {}

  afterInit() {
    this.logger.log('Gateway started...');
  }

  handleConnection(client: Socket) {
    this.eventEmitter.emit(
      'client.connected',
      new ClientConnectedEvent({
        client,
      })
    );
  }

  handleDisconnect(client) {
    this.logger.log('DISCONNECTED', client);
    this.eventEmitter.emit(
      'client.disconnected',
      new ClientDisconnectedEvent({
        client,
      })
    );
  }

  @SubscribeMessage('ping')
  handlePing(client: any, data: string): WsResponse<string> {
    return { event: 'pong', data: data };
  }
}
