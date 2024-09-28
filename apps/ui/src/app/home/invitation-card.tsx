import { Button } from '@chakra-ui/react';
import { Invitation } from '@prisma/client';

export default function InvitationCard({
  invitation,
}: {
  invitation: Invitation;
}) {
  return (
    <div
      className={`bg-slate-600 py-2 px-4 mb-4 rounded-lg text-white flex justify-between items-center`}
    >
      <div>
        <p>{invitation.roomId}</p>
        <span>{new Date(invitation.createdAt).toLocaleString()}</span>
      </div>
      <div>
        <Button className="mr-2">Accept</Button>
        <Button className="">Decline</Button>
      </div>
    </div>
  );
}
