import { UserDto } from '@joey-games/lib';
import { Request } from 'express';

/** Sockets */
import { Response } from 'express';

export interface ClientToServerEvents {
  create: () => void;
}

export interface ServerToClientEvents {
  exception: (err: WsErrorResponse) => void;
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
