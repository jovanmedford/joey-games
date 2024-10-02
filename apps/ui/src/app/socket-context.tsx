import { createContext, useContext, useEffect, useState } from 'react';
import { useStatus } from './hooks/queries';
import { socket } from './socket';
import { useToast } from '@chakra-ui/react';
import { Room } from '@joey-games/lib';

export const SocketDataContext = createContext<SocketData | undefined>(
  undefined
);
export const RoomDataContext = createContext<Room | undefined>(undefined);

export const SocketProvider = ({ children }: { children: any }) => {
  const [socketData, setSocketData] = useState<SocketData | undefined>();
  const [roomData, setRoomData] = useState<Room | undefined>();
  const { data: user } = useStatus();
  const toast = useToast();

  useEffect(() => {
    if (user && user.email) {
      socket.connect();

      socket.on('connect', () => {
        setSocketData({
          id: socket.id as string,
          connected: socket.connected,
        });
      });

      socket.on('exception', (wsError) => {
        toast({
          status: 'warning',
          title: 'WsError',
          description: wsError.message,
        });
      });

      socket.on('joined', ({joinedUser, room}) => {
        if (joinedUser.username === user?.username) {
          toast({
            status: 'info',
            description: `You joined a new room.`,
            title: `Update`,
          });
        } else {
          toast({
            status: 'info',
            description: `${joinedUser.username} has joined the room.`,
            title: `Look who's here:`,
          });
        }
        setRoomData(room);
      });

      socket.on('disconnect', () => {
        setSocketData(undefined);
        setRoomData(undefined);
      });
    }

    return () => {
      socket.off('connect');
      socket.off('exception');
      socket.off('joined');
      socket.off('disconnect');
    };
  }, [user]);

  return (
    <SocketDataContext.Provider value={socketData}>
      <RoomDataContext.Provider value={roomData}>
        {children}
      </RoomDataContext.Provider>
    </SocketDataContext.Provider>
  );
};

export const useSocketData = (): SocketData | undefined => {
  return useContext(SocketDataContext);
};

export const useRoomData = (): Room | undefined => {
  return useContext(RoomDataContext);
};

type SocketData = {
  id: string;
  connected: boolean;
};
