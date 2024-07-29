import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GameMetaModule } from '../game-meta/game-meta.module';

@Module({
  imports: [AuthModule, PrismaModule, GameMetaModule],
})
export class AppModule {}
