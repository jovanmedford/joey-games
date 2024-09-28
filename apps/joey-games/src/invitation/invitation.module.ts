import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';

@Module({
  providers: [InvitationService],
  exports: [InvitationService],
  controllers: [InvitationController]
})
export class InvitationModule {}
