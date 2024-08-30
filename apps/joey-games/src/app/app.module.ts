import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GameMetaModule } from '../game-meta/game-meta.module';
import { MultiplayerGatewayGateway } from '../gateway/multiplayer-gateway.gateway';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    GameMetaModule,
    MultiplayerGatewayGateway,
  ],
})
export class AppModule {}
