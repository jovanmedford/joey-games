import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GameMetaModule } from '../game-meta/game-meta.module';
import { MultiplayerGatewayModule } from '../gateway/multiplayer-gateway.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    GameMetaModule,
    MultiplayerGatewayModule,
    EventEmitterModule.forRoot()
  ],
})
export class AppModule {}
