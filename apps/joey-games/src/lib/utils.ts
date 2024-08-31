import { UserDto } from '@joey-games/lib';
import { User } from '@prisma/client';
import { Socket } from 'socket.io-client';
import { DisconnectDescription } from 'socket.io-client/build/esm/socket';

export const getUserDto = (user: User): UserDto => {
  let { email, username } = user;
  return { email, username };
};

export class ClientConnectedEvent {
  client: Socket;

  constructor({ client }: { client: Socket }) {
    this.client = client;
  }
}

export class ClientDisconnectedEvent {
  client: Socket;

  constructor({ client }: { client: Socket }) {
    this.client = client;
  }
}
