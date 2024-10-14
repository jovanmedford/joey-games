import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Invitation } from '@prisma/client';
import { InvitationReply } from '@joey-games/lib';
import { RoomMgrService } from '../room-mgr/room-mgr.service';

@Injectable()
export class InvitationService {
  constructor(private prisma: PrismaService, private roomMgr: RoomMgrService) {}

  async createInvitation(to: string, roomId: string) {
    try {
      let pendingInvitation = await this.findPendingInvitation(to, roomId);
      if (pendingInvitation) return pendingInvitation;

      let invitation = await this.prisma.invitation.create({
        data: {
          roomId,
          to,
        },
      });
      return invitation;
    } catch (e) {
      console.log(e);
    }
  }

  async updateInvitationStatus({ invitationId, status }: InvitationReply) {
    try {
      let updatedInvitation = await this.prisma.invitation.update({
        where: {
          id: invitationId,
        },
        data: {
          status,
        },
      });
      return updatedInvitation;
    } catch (e) {
      console.log(e);
    }
  }

  async findPendingInvitation(to: string, roomId: string) {
    try {
      let pendingInvitation: Invitation =
        await this.prisma.invitation.findFirst({
          where: {
            roomId,
            to,
            status: null,
          },
        });
      return pendingInvitation;
    } catch (e) {
      console.log(e);
    }
  }

  async findAllPendingInvitations(to: string) {
    try {
      let pendingInvitations: Invitation[] =
        await this.prisma.invitation.findMany({
          where: {
            to,
            status: null,
          },
        });
      let invitationsWithRoom = pendingInvitations.filter((invitation) =>
        this.roomMgr.getRoom(invitation.roomId)
      );
      return invitationsWithRoom;
    } catch (e) {
      console.log(e);
    }
  }
}
