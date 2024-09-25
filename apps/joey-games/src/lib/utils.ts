import { Failure, PlayerData, PlayerStatus, Success, UserDto } from '@joey-games/lib';
import { User } from '@prisma/client';
import session from 'express-session';
import { Socket } from 'socket.io';

export const sessionMiddleWare = session({
  name: 'login',
  secret: process.env.LOGIN_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    sameSite: 'none',
    secure: true,
  },
});

export const getUserDto = (user: User): UserDto => {
  let { email, username } = user;
  return { email, username };
};

export const getNewPlayerData = (
  user: User,
  status: PlayerStatus = 'inactive'
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

export const createSuccessResult = <T>(obj: T): Success<T> => {
  return { success: true, data: obj };
};

export const createFailureResult = (message: string): Failure => {
  return { success: false, message: message };
};
