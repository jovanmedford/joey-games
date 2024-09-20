import { Module } from '@nestjs/common';
import { MultiplayerGateway } from './multiplayer.gateway';
import { RoomMgrModule } from '../room-mgr/room-mgr.module';
import { InvitationModule } from '../invitation/invitation.module';

@Module({
  imports: [RoomMgrModule, InvitationModule],
  providers: [MultiplayerGateway],
})
export class MultiplayerGatewayModule {}
