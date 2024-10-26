'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useStatus } from './hooks/queries';
import { socket } from './socket';
import { useToast } from '@chakra-ui/react';
import { SerializableRoom } from '@joey-games/lib';

export const SocketDataContext = createContext<SocketData | undefined>(
  undefined
);
export const RoomDataContext = createContext<SerializableRoom | undefined>(
  undefined
);

export const SocketProvider = ({ children }: { children: any }) => {
  const [socketData, setSocketData] = useState<SocketData | undefined>();
  const [roomData, setRoomData] = useState<SerializableRoom | undefined>();
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

      socket.on('room_update', (update) => {
        if (update.player.status == 'connected') {
          if (update.player.username === user?.username) {
            toast({
              status: 'info',
              description: `You joined a new room.`,
              title: `Update`,
            });
          } else {
            toast({
              status: 'info',
              description: `${update.player.username} has joined the room.`,
              title: `Look who's here:`,
            });
          }
        }

        if (update.player.status == "disconnected") {
          toast({
            status: 'info',
            description: `${update.player.username} has left the room.`,
            title: `Update`,
          });
        }

        if (update.player.status == "reconnecting") {
          toast({
            status: 'info',
            description: `${update.player.username} is trying to reconnect...`,
            title: `Update`,
          });
        }

        setRoomData(update.room);
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
      socket.off('room_update');
      socket.disconnect();
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

export const useRoomData = (): SerializableRoom | undefined => {
  return useContext(RoomDataContext);
};

type SocketData = {
  id: string;
  connected: boolean;
};
