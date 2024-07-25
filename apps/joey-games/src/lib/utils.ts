import { User } from '@prisma/client';

export const getUserDto = (user: User) => {
  let { email, username, id } = user;
  return { email, username, id };
};
