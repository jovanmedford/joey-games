import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvitationStatus } from '@prisma/client';

@Injectable()
export class InvitationService {
  constructor(private prisma: PrismaService) {}

  async createInvitation(to: string, roomId: string) {
    let invitation = await this.prisma.invitation.create({
      data: {
        roomId,
        to,
      },
    });
    return invitation;
  }

  async updateInvitationStatus(invitationId: number, status: InvitationStatus) {
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
}
