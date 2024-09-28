import { User } from '@prisma/client';
import { Room } from '../room';

export type UserDto = Pick<User, 'email' | 'username'> & {
  currentRoom?: Room;
};
