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
  await prisma.gameMeta.create({
    data: {
      id: 'memory_game',
      title: 'Memory Game',
      description: 'Test your memory with this game.',
      imgUrl: '../joey-games/assets/memory-game-logo.png',
      minPlayers: 1,
      maxPlayers: 4,
      isPlayable: true,
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
