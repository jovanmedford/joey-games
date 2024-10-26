import {
  AuthenticatedSocket,
  PlayerData,
  PlayerStatus,
  Result,
  Room,
  UserDto,
} from '@joey-games/lib';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getNewPlayerData } from '../lib/utils';
import { OnEvent } from '@nestjs/event-emitter';
import { Server } from 'socket.io';

@Injectable()
export class RoomMgrService {
  rooms: Map<string, Room>;

  constructor(private prisma: PrismaService) {
    this.rooms = new Map();
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string) {
    return this.rooms.delete(roomId);
  }

  printAllRooms() {
    console.log('All Room Data');
    console.log('--------------');
    this.rooms.forEach((room) => {
      console.group();
      console.log(room.id);
      console.log(room.host);
      console.log(room.currentActivity);
      room.players.forEach((player) => {
        console.group();
        console.log(player.email);
        console.log(player.status);
        console.log(player.currentRoom);
        console.groupEnd();
      });
      console.groupEnd();
    });
  }

  printRoom(roomId: string) {
    let room = this.getRoom(roomId);
    if (!room) {
      console.log('Room does not exist.');
      return;
    }

    console.group();
    console.log(room.id);
    console.log(room.host);
    console.log(room.currentActivity);
    room.players.forEach((player) => {
      console.group();
      console.log(player.email);
      console.log(player.status);
      console.log(player.currentRoom);
      console.groupEnd();
    });
    console.groupEnd();
  }

  findRoomByUser(userEmail: string) {
    for (let [, room] of this.rooms) {
      if (room.players.has(userEmail)) {
        return room;
      }
    }
  }

  findRoomByUserStatus(userEmail: string, status: PlayerStatus) {
    for (let [, room] of this.rooms) {
      let player = room.players.get(userEmail);
      if (player && player.status == status) {
        return room;
      }
    }
  }

  async createRoom(host: string): Promise<Result<Room>> {
    let newRoom = new Room(host);
    this.rooms.set(newRoom.id, newRoom);
    let result = await this.addPlayerToRoomData(newRoom.id, host, 'connected');
    if (result.success) {
      return { success: true, data: newRoom };
    }
  }

  async addPlayerToRoomData(
    roomId: string,
    playerEmail: string,
    status: PlayerStatus = 'inactive'
  ): Promise<Result<PlayerData>> {
    let room = this.rooms.get(roomId);

    let playerFromDb = await this.prisma.user.findFirst({
      where: { email: playerEmail },
    });
    let newPlayer = getNewPlayerData(playerFromDb, status);

    if (!newPlayer) {
      return { success: false, message: 'Player not found.' };
    }

    if (room.players.get(newPlayer.email)) {
      return { success: false, message: 'Player is already in the room.' };
    }

    room.players.set(newPlayer.email, newPlayer);

    return { success: true, data: newPlayer };
  }

  setPlayerStatus(email: string, status: PlayerStatus) {
    for (let [, room] of this.rooms) {
      if (room.players.has(email)) {
        room.setPlayerStatus(email, status);
      }
    }
  }

  /** -- Event Handlers */

  @OnEvent('client.connected')
  handleClientConnected(client: AuthenticatedSocket, server: Server) {
    let user = client.request.session.user;
    let room = this.findRoomByUserStatus(user.email, 'reconnecting');
    if (room) {
      client.join(room.id);
      room.setPlayerStatus(user.email, 'connected');
      let player = room?.players.get(user.email);
      server.to(room.id).emit('room_update', {
        player,
        room: room.getSerializableRoomData(),
      });
    }
  }

  @OnEvent('client.inactive')
  handleClientInactive(client: AuthenticatedSocket, server: Server) {
    let user = client.request.session.user;
    for (let roomId of client.rooms) {
      let room = this.getRoom(roomId);
      let player = room?.players.get(user.email);
      if (player && player.status === 'connected') {
        room.setPlayerStatus(user.email, 'reconnecting');
        server.to(room.id).emit('room_update', {
          player,
          room: room.getSerializableRoomData(),
        });
      }
    }
  }

  @OnEvent('client.disconnected')
  handleClientDisonnected(roomIds: string[], user: UserDto, server: Server) {
    for (let roomId of roomIds) {
      let room = this.getRoom(roomId);
      if (!room) continue;

      let player = room?.players.get(user.email);
      if (!player) continue
      
      room.setPlayerStatus(user.email, 'disconnected')

      if (room.shouldCleanUp()) {
        this.deleteRoom(room.id);
        continue
      }
      
      server.to(room.id).emit('room_update', {
        player,
        room: room.getSerializableRoomData(),
      });
    }
  }

  @OnEvent('auth.logout')
  handlePlayerLogout(user: UserDto) {
    this.setPlayerStatus(user.email, 'disconnected');
  }
}
