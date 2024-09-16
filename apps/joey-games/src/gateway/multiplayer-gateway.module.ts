import { Module } from '@nestjs/common';
import { MultiplayerGateway } from './multiplayer.gateway';
import { RoomMgrModule } from '../room-mgr/room-mgr.module';

@Module({
  imports: [RoomMgrModule],
  providers: [MultiplayerGateway],
})
export class MultiplayerGatewayModule {}
