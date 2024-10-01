'use client';
import Logout from 'apps/ui/icons/logout';
import GameCard from './game-card';
import gameData from './games.json';
import { useLogout, usePendingInvitations, useStatus } from '../hooks/queries';
import Lobby from './lobby';
import InvitationCard from './invitation-card';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '../socket';

export default function Index() {
  let queryClient = useQueryClient();
  let mainTitle = gameData[0];
  let games = gameData.slice(1);
  let toast = useToast();
  const { status, data: user, isError: statusError } = useStatus();

  useEffect(() => {
    socket.on('invited', (invitation) => {
      toast({
        status: 'info',
        description: invitation.roomId,
        title: 'You have a new invitation',
      });
      queryClient.invalidateQueries({ queryKey: ['pendingInvitations'] });
    });

    socket.on('joined', (message) => {
      toast({
        status: 'info',
        description: message,
        title: `Look who's here:`,
      });
    })

    return () => {
      socket.off('invited');
    };
  }, [user, socket]);

  const {
    status: invitationStatus,
    data: invitations,
    isError: invitationError,
  } = usePendingInvitations();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="mx-4 my-8 xl:w-10/12 xl:mx-auto">
      <header className="flex justify-between">
        {status === 'success' ? (
          <span className="font-bold">{user.username}</span>
        ) : null}

        <Logout handleLogout={handleLogout} />
      </header>
      <main>
        <h1 className="text-center mb-8 uppercase">joey games</h1>
        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton>
              View Invitations{' '}
              {Array.isArray(invitations) ? invitations.length : 0}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel className="max-h-40 overflow-y-scroll">
              {Array.isArray(invitations) && invitations.length > 0 ? (
                invitations.map((invite) => {
                  return <InvitationCard invitation={invite} />;
                })
              ) : (
                <p>No invitations.</p>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <section className="lg:grid lg:grid-cols-12 lg: gap-4">
          <div className="col-start-1 col-end-10">
            <GameCard className="mb-4" meta={mainTitle} />
            <section className="grid md:grid-cols-2 gap-4 ">
              {games.map((meta) => (
                <GameCard key={meta.id} meta={meta}></GameCard>
              ))}
            </section>
          </div>
          <Lobby />
        </section>
      </main>
    </div>
  );
}
