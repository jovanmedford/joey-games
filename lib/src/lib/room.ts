import { UserDto } from './dtos';
import { v4 as uuidv4 } from 'uuid';

export class Room {
  id: string;
  currentActivity: Activity;
  host: string;
  players: Map<string, PlayerData>;

  constructor(host: string) {
    this.id = uuidv4();
    this.currentActivity = 'lobby';
    this.host = host;
    this.players = new Map<string, PlayerData>();
  }

  setPlayerStatus(playerId: string, status: PlayerStatus) {
    let player = this.players.get(playerId);
    if (player) {
      player.status = status;
    } else {
      console.log('Player not found.');
    }
  }

  getSerializableRoomData(): SerializableRoom {
    return {
      id: this.id,
      currentActivity: this.currentActivity,
      host: this.host,
      players: Object.fromEntries(this.players)
    };
  }
}

export interface SerializableRoom {
  id: string;
  currentActivity: Activity;
  host: string;
  players: Record<string, PlayerData>;
}

export interface PlayerData extends UserDto {
  status: PlayerStatus;
}
export type PlayerStatus =
  | 'disconnected'
  | 'inactive'
  | 'connected'
  | 'reconnecting';
export type Activity = 'lobby' | 'memoryGame';
