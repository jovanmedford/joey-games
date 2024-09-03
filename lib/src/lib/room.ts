import { UserDto } from "./dtos";

export interface Room {
  id: string;
  currentActivity: Activity;
  host: string;
  players: Map<string, PlayerData>;
}

export interface PlayerData extends UserDto {
  status: PlayerStatus
}
export type PlayerStatus = 'pending' | 'disconnected' | 'declined' | 'ready';
export type Activity = 'lobby' | 'memoryGame';
