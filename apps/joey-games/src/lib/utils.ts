import { UserDto } from '@joey-games/lib';
import { User } from '@prisma/client';

export const getUserDto = (user: User): UserDto => {
  let { email, username } = user;
  return { email, username };
};
