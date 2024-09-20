import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientConnectedEvent, ClientDisconnectedEvent } from '../lib/utils';
import { Socket, Server } from 'socket.io';
import { RoomGuard } from '../guards/room.guard';
import { GatewayGuard } from '../guards/gateway.guard';
import { RoomMgrService } from '../room-mgr/room-mgr.service';
import { InvitationService } from '../invitation/invitation.service';
import { AuthenticatedSocket, InvitationReply } from '../lib/types';
import { Room } from '@joey-games/lib';

@UseGuards(GatewayGuard)
@WebSocketGateway()
export class MultiplayerGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MultiplayerGateway.name);
  connectionMap: Map<string, AuthenticatedSocket>;

  constructor(
    private eventEmitter: EventEmitter2,
    private roomMgr: RoomMgrService,
    private invitationService: InvitationService
  ) {
    this.connectionMap = new Map();
  }

  afterInit() {
    this.logger.log('Gateway started...');
  }

  handleConnection(client: AuthenticatedSocket) {
    this.logger.debug(
      `Number of sockets connected: ${this.server.sockets.sockets.size}`
    );
    this.eventEmitter.emit(
      'client.connected',
      new ClientConnectedEvent({
        client,
      })
    );
    this.connectionMap.set(client.request.session.user.email, client);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(
      `DISCONNECTED. Number of sockets connected: ${this.server.sockets.sockets.size}`
    );
    this.eventEmitter.emit(
      'client.disconnected',
      new ClientDisconnectedEvent({
        client,
      })
    );
    this.connectionMap.delete(client.request.session.user.email);
  }

  @SubscribeMessage('connection_error')
  handleConnectionError(@MessageBody() data: string) {
    this.logger.debug(data);
  }

  @SubscribeMessage('ping')
  handlePing(client: any, data: string): WsResponse<string> {
    return { event: 'pong', data: data };
  }

  // Should require host privelege
  @SubscribeMessage('send_invitation')
  async handleSendInvitation(
    client: AuthenticatedSocket,
    inviteeEmail: string
  ) {
    /**
     * 1. Check if the sender is in a room
     * 2. Check if a non-responded invitation already exists - if yes, push the same invitation
     * 3. Create a new invitation
     * 4. Emit invited
     */
   
    let sender = client.request.session.user;

    if (!sender.currentRoom) {
      let result = await this.roomMgr.createRoom(sender.email);
      if (result.success === false) {
        throw new WsException(result.message);
      }
      sender.currentRoom = result.data;
      client.join(result.data.id);
    }

    let result = await this.roomMgr.addPlayerToRoomData(
      sender.currentRoom.id,
      inviteeEmail
    );

    if (result.success === false) {
      throw new WsException(result.message);
    }

    let invitation = await this.invitationService.createInvitation(
      inviteeEmail,
      sender.currentRoom.id
    );

    let inviteeClient = this.connectionMap.get(inviteeEmail);
    if (inviteeClient) {
      inviteeClient.emit('invited', invitation);
    }
  }

  @SubscribeMessage('reply_to_invitation')
  handleSendInvitationReply(
    client: AuthenticatedSocket,
    reply: InvitationReply
  ) {
    /**
     * 	1. If the user is already in a room then return an error
     *  2. Check that the user still has room access
     *  3. If user accepted
     *    a. Join room - if successful change player_status to connected
     *    b. Update invitation_status to accepted and emit "joined" to room
     *  X
     */
    let invitee = client.request.session.user;
    let room = this.roomMgr.getRoom(reply.roomId);
    let playerData = room.players.get(invitee.email);


    if (!room) {
      throw new WsException('Room no longer exists.');
    }

    if (!playerData) {
      throw new WsException("You don't have access to this room.");
    }

    if (reply.status == 'accepted') {
      if (invitee.currentRoom) {
        throw new WsException('You are already in a room.');
      }

      client.join(reply.roomId);
      this.server
        .to(reply.roomId)
        .emit('joined', `${invitee.username} has joined the room.`);
    }

    this.invitationService.updateInvitationStatus(reply);
  }

  @UseGuards(RoomGuard)
  @SubscribeMessage('join_room')
  handleJoinRoom(socket: Socket) {
    this.logger.log(`Join: ${socket.id}`);
  }
}
