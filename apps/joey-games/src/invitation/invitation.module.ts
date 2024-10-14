import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { RoomMgrModule } from '../room-mgr/room-mgr.module';

@Module({
  providers: [InvitationService],
  imports: [RoomMgrModule],
  exports: [InvitationService],
  controllers: [InvitationController],
})
export class InvitationModule {}
