import { Module } from '@nestjs/common';
import { GameMetaController } from './game-meta.controller';
import { GameMetaService } from './game-meta.service';

@Module({
  controllers: [GameMetaController],
  providers: [GameMetaService]
})
export class GameMetaModule {}
