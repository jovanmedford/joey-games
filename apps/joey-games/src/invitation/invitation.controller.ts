import { Controller, Get, Req } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { AuthenticatedRequest } from '@joey-games/lib';

@Controller('invitation')
export class InvitationController {
  constructor(private invitationService: InvitationService) {}

  @Get('pending')
  async findAll(@Req() request: AuthenticatedRequest) {
    return await this.invitationService.findAllPendingInvitations(
      request.session.user.email
    );
  }
}
