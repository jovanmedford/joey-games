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
import { Server } from 'socket.io';
import { RoomGuard } from '../guards/room.guard';
import { GatewayGuard } from '../guards/gateway.guard';
import { RoomMgrService } from '../room-mgr/room-mgr.service';
import { InvitationService } from '../invitation/invitation.service';
import { AuthenticatedSocket, InvitationReply, UserDto } from '@joey-games/lib';
import { bufferPeriod } from '../lib/constants';
import { UsersService } from '../users/users.service';

@UseGuards(GatewayGuard)
@WebSocketGateway()
export class MultiplayerGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MultiplayerGateway.name);
  connectionMap: Map<string, AuthenticatedSocket>;
  disconnectionMap: Map<string, NodeJS.Timeout>;

  constructor(
    private eventEmitter: EventEmitter2,
    private roomMgr: RoomMgrService,
    private invitationService: InvitationService,
    private userService: UsersService
  ) {
    this.connectionMap = new Map();
    this.disconnectionMap = new Map();
  }

  afterInit() {
    this.logger.log('Gateway started...');
  }

  removeDisconnectTimer(clientId: string) {
    let disconnectTimer = this.disconnectionMap.get(clientId);
    this.disconnectionMap.delete(clientId);
    clearTimeout(disconnectTimer);
  }

  disconnectClientCleanup({
    client,
    user,
    roomIds,
  }: {
    client: AuthenticatedSocket;
    user: UserDto;
    roomIds: string[];
  }) {
    this.removeDisconnectTimer(client.id);
    this.connectionMap.delete(user.email);
    this.eventEmitter.emit('client.disconnected', roomIds, user, this.server);
  }

  handleConnection(client: AuthenticatedSocket) {
    this.logger.debug(
      `Number of sockets connected: ${this.server.sockets.sockets.size}. New: ${client.id}`
    );

    this.printState(`Before connecting ${client.id}`);

    client.on('disconnecting', (reason) =>
      this.handleDisconnecting(client, reason)
    );

    let user = client.request.session.user;

    // Handle reconnected instance
    if (client.recovered) {
      this.removeDisconnectTimer(client.id);
    }

    // Handle new connection with the same email (Refresh page)
    if (this.connectionMap.has(user.email)) {
      let existingConnection = this.connectionMap.get(user.email);
      this.removeDisconnectTimer(existingConnection.id);
    }

    this.eventEmitter.emit('client.connected', client, this.server);
    this.connectionMap.set(client.request.session.user.email, client);
  }

  // Registered in handleConnection
  handleDisconnecting(client: AuthenticatedSocket, reason) {
    let user = client.request.session.user;
    let userCpy = { ...user };
    let roomsCpy = [...client.rooms];
    this.logger.debug(`Disconnecting:...${client.id} - ${reason}`);

    if (!this.disconnectionMap.has(client.id)) {
      let disconnectTimer = setTimeout(() => {
        this.disconnectClientCleanup({
          client,
          user: userCpy,
          roomIds: roomsCpy,
        });
      }, bufferPeriod);
      this.disconnectionMap.set(client.id, disconnectTimer);
    }

    this.eventEmitter.emit('client.inactive', client, this.server);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.printState(`After disconnecting ${client.id}`);
    this.logger.log(
      `DISCONNECTED. Number of sockets connected: ${this.server.sockets.sockets.size}`
    );
  }

  printState(message: string) {
    console.log(message.toUpperCase());
    console.log('Connections:');
    console.group();
    this.connectionMap.forEach((connection, key) =>
      console.log(`${key} - ${connection.id}`)
    );
    console.groupEnd();

    console.log('Scheduled Disconnections:');
    console.group();
    this.disconnectionMap.forEach((disconnection, key) =>
      console.log(`${key} - ${disconnection}`)
    );
    console.groupEnd();

    this.roomMgr.printAllRooms();
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
    let inviteeUser = await this.userService.findUser(inviteeEmail);
    if (!inviteeUser) {
      throw new WsException('User not found.');
    }

    let sender = client.request.session.user;
    let inviteeClient = this.connectionMap.get(inviteeEmail);

    if (inviteeClient) {
      this.logger.log(`Sending to...${inviteeClient.id}`);
    }

    if (!sender.currentRoom) {
      let result = await this.roomMgr.createRoom(sender.email);
      if (result.success === false) {
        throw new WsException(result.message);
      }
      sender.currentRoom = result.data;
      client.join(result.data.id);
      this.logger.log(`Room: ${result.data.id}.`);
    }

    let addPlayerDataResult = await this.roomMgr.addPlayerToRoomData(
      sender.currentRoom.id,
      inviteeEmail
    );

    if (addPlayerDataResult.success === false) {
      throw new WsException(addPlayerDataResult.message);
    }

    let invitation = await this.invitationService.createInvitation(
      inviteeEmail,
      sender.currentRoom.id
    );

    this.logger.log(`Invitation created for: ${client.id}.`);

    if (inviteeClient) {
      this.logger.debug(`Invitation sent.`);
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
      room.setPlayerStatus(playerData.email, 'connected');
      this.server.to(reply.roomId).emit('room_update', {
        player: { ...invitee, status: 'connected' },
        room: room.getSerializableRoomData(),
      });

      console.log('Replied to room:', room);
    }

    this.invitationService.updateInvitationStatus(reply);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(client: AuthenticatedSocket, roomId: string) {
    let room = this.roomMgr.getRoom(roomId);
    let user = client.request.session.user;
    delete user.currentRoom;
    if (room) {
      room.players.delete(user.email);
      if (room.players.size < 1) this.roomMgr.deleteRoom(roomId);
    }
  }

  @UseGuards(RoomGuard)
  @SubscribeMessage('join_room')
  handleJoinRoom(client: AuthenticatedSocket, { roomId }) {
    client.join(roomId);
  }
}
