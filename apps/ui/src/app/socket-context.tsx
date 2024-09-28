import { ClientToServerEvents, ServerToClientEvents } from '@joey-games/lib';
import { createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

const createSocket = () => {
  let socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    `${process.env.NEXT_PUBLIC_ORIGIN}`,
    {
      autoConnect: false,
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    }
  );
  return socket;
};

export const SocketContext = createContext<SocketContextType>(createSocket());

export const SocketProvider = ({ children }: { children: any }) => {
  const socket = createSocket();
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

type SocketContextType = Socket<ServerToClientEvents, ClientToServerEvents>;
