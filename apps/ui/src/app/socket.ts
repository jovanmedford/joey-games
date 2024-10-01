import { ClientSocket } from '@joey-games/lib';
import { io } from 'socket.io-client';

const createSocket = () => {
  let socket: ClientSocket = io(`${process.env.NEXT_PUBLIC_ORIGIN}`, {
    autoConnect: false,
    withCredentials: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
  });
  return socket;
};

export let socket = createSocket();
