import {
  PlayerData,
  PlayerStatus,
  Result,
  Room,
  UserDto,
} from '@joey-games/lib';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getNewPlayerData } from '../lib/utils';

@Injectable()
export class RoomMgrService {
  rooms: Map<string, Room>;

  constructor(private prisma: PrismaService) {
    this.rooms = new Map();
  }

  async createRoom(host: string): Promise<Result<Room>> {
    let newRoom = new Room(host);
    this.rooms.set(newRoom.id, newRoom);
    let result = await this.addPlayerToRoomData(newRoom.id, host, 'ready');
    if (result.success) {
      return { success: true, data: newRoom };
    }
  }

  async addPlayerToRoomData(
    roomId: string,
    playerEmail: string,
    status: PlayerStatus = 'pending'
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
