import { Module } from '@nestjs/common';
import { MultiplayerGateway } from './multiplayer.gateway';
import { RoomMgrModule } from '../room-mgr/room-mgr.module';
import { InvitationModule } from '../invitation/invitation.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [RoomMgrModule, InvitationModule, UsersModule],
  providers: [MultiplayerGateway],
})
export class MultiplayerGatewayModule {}
