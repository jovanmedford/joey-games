import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: 'dij@games.com',
      username: 'dij123',
      password: await argon.hash(process.env.DIJ_PASSWORD),
    },
  });
  await prisma.user.create({
    data: {
      email: 'joey@games.com',
      username: 'joeygames1',
      password: await argon.hash(process.env.JOEY_PASSWORD),
    },
  });
  console.log('Seeding completed.');
}

// execute
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
