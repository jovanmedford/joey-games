import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Invitation, InvitationStatus } from '@prisma/client';
import { InvitationReply } from '@joey-games/lib';
import { Result } from '@joey-games/lib';
import { createFailureResult, createSuccessResult } from '../lib/utils';

@Injectable()
export class InvitationService {
  constructor(private prisma: PrismaService) {}

  async createInvitation(to: string, roomId: string) {
    let pendingInvitation = await this.findPendingInvitation(to, roomId);
    if (pendingInvitation) return pendingInvitation;
    
    let invitation = await this.prisma.invitation.create({
      data: {
        roomId,
        to,
      },
    });
    return invitation;
  }

  async updateInvitationStatus({invitationId,  status}: InvitationReply)  {
    let updatedInvitation = await this.prisma.invitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status,
      },
    });
    return updatedInvitation;
  }

  async findPendingInvitation(to: string, roomId: string) {
    let pendingInvitation: Invitation = await this.prisma.invitation.findFirst({
      where: {
        roomId,
        to,
        status: null,
      },
    });
    return pendingInvitation
  }
}
