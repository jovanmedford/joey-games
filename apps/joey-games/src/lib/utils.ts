import { PlayerData, PlayerStatus, UserDto } from '@joey-games/lib';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';

export const getUserDto = (user: User): UserDto => {
  let { email, username } = user;
  return { email, username };
};

export const getNewPlayerData = (
  user: User,
  status: PlayerStatus = 'pending'
): PlayerData => {
  let player = getUserDto(user) as PlayerData;
  player.status = status;
  return player;
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
