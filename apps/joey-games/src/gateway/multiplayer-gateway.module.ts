import { Module } from '@nestjs/common';
import { MultiplayerGatewayGateway } from './multiplayer-gateway.gateway';
import { RoomMgrModule } from '../room-mgr/room-mgr.module';

@Module({
  imports: [RoomMgrModule],
  providers: [MultiplayerGatewayGateway],
})
export class MultiplayerGatewayModule {}
