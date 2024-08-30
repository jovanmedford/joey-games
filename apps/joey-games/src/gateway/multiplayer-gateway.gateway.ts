import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway()
export class MultiplayerGatewayGateway {
  @SubscribeMessage('ping')
  handlePing(client: any, data: string): string {
    return data;
  }
}
