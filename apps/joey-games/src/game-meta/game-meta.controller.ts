import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GameMetaService } from './game-meta.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Controller('game-meta')
export class GameMetaController {
  constructor(private gameMetaService: GameMetaService) {}

  @Get()
  async findAll() {
    return await this.gameMetaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.gameMetaService.findOne(id);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new NotFoundException();
        }
      }
    }
  }
}
