import { UserDto } from '@joey-games/lib';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getUserDto } from '../lib/utils';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUser(email: string): Promise<UserDto> {
    try {
      let user = await this.prisma.user.findFirst({
        where: {
          email,
        },
      });
      return getUserDto(user);
    } catch (e) {
      console.log(e);
    }
  }
}
