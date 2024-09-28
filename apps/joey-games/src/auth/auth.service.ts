import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, SignupDto } from './dto';
import { emailExistsMessage, userExistsMessage } from '../lib/constants';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';
import { getUserDto } from '../lib/utils';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(loginInfo: LoginDto) {
    try {
      const user: User = await this.prisma.user.findFirstOrThrow({
        where: { email: loginInfo.email },
      });
      if (await argon.verify(user.password, loginInfo.password)) {
        let userDto = getUserDto(user);
        return userDto;
      } else {
        throw new UnauthorizedException();
      }
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2018') {
          throw new UnauthorizedException();
        }
      }
      throw e;
    }
  }

  async signup(signupInfo: SignupDto) {
    signupInfo.password = await argon.hash(signupInfo.password);
    try {
      let user = await this.prisma.user.create({
        data: signupInfo,
        select: { email: true, username: true },
      });
      return user;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          if (e.meta.target[0].includes('email')) {
            throw new ConflictException(emailExistsMessage);
          }

          if (e.meta.target[0].includes('username')) {
            throw new ConflictException(userExistsMessage);
          }
        }
      }
      throw e;
    }
  }
}
