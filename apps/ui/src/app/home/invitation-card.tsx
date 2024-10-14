import { Button } from '@chakra-ui/react';
import { Invitation, InvitationStatus } from '@prisma/client';
import { socket } from '../socket';
import { useQueryClient } from '@tanstack/react-query';

export default function InvitationCard({
  invitation,
}: {
  invitation: Invitation;
}) {
  let queryClient = useQueryClient();
  let handleResponseClick = (responseStatus: InvitationStatus) => {
    socket.emit('reply_to_invitation', {
      invitationId: invitation.id,
      roomId: invitation.roomId,
      status: responseStatus,
    });
    queryClient.invalidateQueries({ queryKey: ['pendingInvitations'] });
  };

  return (
    <div
      className={`bg-slate-600 py-2 px-4 mb-4 rounded-lg text-white flex justify-between items-center`}
    >
      <div>
        <p>{invitation.roomId}</p>
        <span>{new Date(invitation.createdAt).toLocaleString()}</span>
      </div>
      <div>
        <Button
          onClick={() => handleResponseClick('accepted')}
          className="mr-2"
        >
          Accept
        </Button>
        <Button onClick={() => handleResponseClick('declined')}>Decline</Button>
      </div>
    </div>
  );
}
