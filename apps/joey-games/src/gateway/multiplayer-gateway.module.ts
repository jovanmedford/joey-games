import { Module } from '@nestjs/common';
import { MultiplayerGatewayGateway } from './multiplayer-gateway.gateway';

@Module({
  providers: [MultiplayerGatewayGateway],
})
export class MultiplayerGatewayModule {}
