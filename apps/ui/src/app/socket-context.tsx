import { createContext, useContext, useEffect, useState } from 'react';
import { useStatus } from './hooks/queries';
import { socket } from './socket';

export const SocketDataContext = createContext<SocketData | undefined>(
  undefined
);

export const SocketProvider = ({ children }: { children: any }) => {
  const [socketData, setSocketData] = useState<SocketData | undefined>(
    undefined
  );
  const { data: user } = useStatus();

  useEffect(() => {
    if (user && user.email) {
      socket.connect();

      socket.on('connect', () => {
        setSocketData({
          id: socket.id as string,
          connected: socket.connected,
        });
      });

      socket.on('disconnect', () => {
        setSocketData(undefined);
      });
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [user]);

  return (
    <SocketDataContext.Provider value={socketData}>
      {children}
    </SocketDataContext.Provider>
  );
};

export const useSocketData = (): SocketData | undefined => {
  return useContext(SocketDataContext);
};

type SocketData = {
  id: string;
  connected: boolean;
};
