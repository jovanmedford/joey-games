import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GameMetaModule } from '../game-meta/game-meta.module';
import { MultiplayerGatewayGateway } from '../gateway/multiplayer-gateway.gateway';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    GameMetaModule,
    MultiplayerGatewayGateway,
    EventEmitterModule.forRoot()
  ],
})
export class AppModule {}
