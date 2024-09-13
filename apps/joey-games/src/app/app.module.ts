import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GameMetaModule } from '../game-meta/game-meta.module';
import { MultiplayerGatewayModule } from '../gateway/multiplayer-gateway.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    SessionModule,
    GameMetaModule,
    MultiplayerGatewayModule,
    EventEmitterModule.forRoot()
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: '/auth/(.*)', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}
