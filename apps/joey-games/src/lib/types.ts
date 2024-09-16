import { UserDto } from '@joey-games/lib';
import { Request } from 'express';

/** Sockets */
export interface ClientToServerEvents {
  create_room: () => void;
}

export interface ServerToClientEvents {
  exception: (err: WsErrorResponse) => void;
  new_room: (id: string) => void;
}

export interface WsErrorResponse {
  status: 'success' | 'error';
  message: string;
}

/** Request */
export type AuthenticatedRequest = Request & {
  session: {
    user: UserDto;
  };
};
