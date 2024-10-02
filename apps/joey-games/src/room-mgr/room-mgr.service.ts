import { PlayerData, PlayerStatus, Result, Room } from '@joey-games/lib';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getNewPlayerData } from '../lib/utils';

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
    console.log('Room Data');
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

  joinRoom(user: string, roomId: string) {
    // 2. Verify that the user is in the room
    // 3. Add the user to the room
  }

  leaveRoom() {}
}
