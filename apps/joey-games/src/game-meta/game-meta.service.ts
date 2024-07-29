import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameMeta } from '@prisma/client';

@Injectable()
export class GameMetaService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<GameMeta[]> {
    return await this.prisma.gameMeta.findMany();
  }

  async findOne(gameId: string): Promise<GameMeta> {
    console.log(gameId)
    return await this.prisma.gameMeta.findFirstOrThrow({
      where: { id: gameId },
    });
  }
}
