import { Room, UserDto } from '@joey-games/lib';
import { Socket } from 'socket.io';
import { Socket as SocketIoClient } from 'socket.io-client';
import { Request } from 'express';
import { Invitation, InvitationStatus } from '@prisma/client';

/** Sockets */
export type ClientSocket = SocketIoClient<
  ServerToClientEvents,
  ClientToServerEvents
>;

export interface ClientToServerEvents {
  create_room: () => void;
  join_room: ({ roomId }: { roomId: string }) => void;
  send_invitation: (to: string) => void;
  reply_to_invitation: ({ invitationId, status }: InvitationReply) => void;
  ping: (message: string) => void;
}

export interface ServerToClientEvents {
  exception: (err: WsErrorResponse) => void;
  new_room: (id: string) => void;
  invited: (invitation: Invitation) => void;
  joined: (joinedRoom: JoinedRoom) => void;
  pong: (message: string) => void;
}

export interface WsErrorResponse {
  status: 'success' | 'error';
  message: string;
}

/** Request */
export interface AuthenticatedSocket extends Socket {
  request: AuthenticatedRequest;
}

export type AuthenticatedRequest = Request & {
  session: {
    user: UserDto;
  };
};

export type InvitationReply = {
  invitationId: number;
  roomId: string;
  status: InvitationStatus;
};

export type JoinedRoom = {
  joinedUser: UserDto;
  room: Room;
};
