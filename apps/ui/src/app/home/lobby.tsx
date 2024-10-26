import { Button, Input, Spinner } from '@chakra-ui/react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRoomData, useSocketData } from '../socket-context';
import { socket } from '../socket';
import { useStatus } from '../hooks/queries';

export default function Lobby() {
  const [email, setEmail] = useState('');
  const socketData = useSocketData();
  const roomData = useRoomData();
  const { data: user } = useStatus();

  console.log('ROOM', roomData);

  const handleSendInvitation = (onClose: () => void) => {
    if (!socket) {
      console.log('No socket.');
    }
    socket.emit('ping', 'test');
    socket.emit('send_invitation', email);
    onClose();
  };

  const handleEmailChange = (e: any) => setEmail(e.target.value);
  return (
    <div className="hidden lg:block col-start-10 col-end-13 border-slate-300 border-2 rounded-md">
      <header className="py-2 px-4 border-b-2 flex justify-between items-center">
        <h2>Lobby</h2>
        <Popover>
          {({ onClose }) => (
            <>
              {!roomData || (roomData && roomData.host === user?.email) ? (
                <PopoverTrigger>
                  <Button>Add user</Button>
                </PopoverTrigger>
              ) : null}
              <PopoverContent>
                <PopoverArrow />
                <PopoverBody bg="gray.50">
                  <Input
                    onChange={handleEmailChange}
                    placeholder="sally@example.com"
                    bg="white"
                    type="text"
                  />
                </PopoverBody>
                <PopoverFooter className="flex justify-end">
                  <Button
                    _hover={{ background: 'green.600' }}
                    bg="green.500"
                    color="white"
                    onClick={() => handleSendInvitation(onClose)}
                  >
                    Invite
                  </Button>
                </PopoverFooter>
              </PopoverContent>
            </>
          )}
        </Popover>
      </header>
      <div className="py-2 px-4">
        {socketData && socketData.connected ? (
          <div className="text-center mt-2">{socketData.id}</div>
        ) : (
          <div className="pt-4 px-4 text-center">
            <Spinner />
          </div>
        )}
        {roomData ? (
          <ul>
            {Object.entries(roomData.players).map(([key, player]) => {
              if (player.email !== user?.email && player.status == "connected") {
                return <li key={key}>{player.username}</li>;
              }
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
