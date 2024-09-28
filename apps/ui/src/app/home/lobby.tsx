import { Button, Input } from '@chakra-ui/react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useSocket } from '../socket-context';

export default function Lobby() {
  const [email, setEmail] = useState('');
  const socket = useSocket();

  const handleSendInvitation = (onClose: () => void) => {
    if (!socket) {
      console.log('No socket.');
    }
    socket.emit('ping', 'test');
    socket.emit('send_invitation', email);
    onClose();
  };

  const handleReconnectClick = () => {
    socket.connect();
  };

  const handleEmailChange = (e: any) => setEmail(e.target.value);
  return (
    <div className="hidden lg:block col-start-10 col-end-13 border-slate-300 border-2 rounded-md">
      <header className="py-2 px-4 border-b-2 flex justify-between items-center">
        <h2>Lobby</h2>
        <Popover>
          {({ onClose }) => (
            <>
              <PopoverTrigger>
                <Button>Add user</Button>
              </PopoverTrigger>
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
      <div className="pt-4 px-4">
        <Button onClick={handleReconnectClick}>Reconnect</Button>
      </div>
    </div>
  );
}
