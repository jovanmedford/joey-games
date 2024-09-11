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
}

export interface PlayerData extends UserDto {
  status: PlayerStatus;
}
export type PlayerStatus = 'pending' | 'disconnected' | 'declined' | 'ready';
export type Activity = 'lobby' | 'memoryGame';
