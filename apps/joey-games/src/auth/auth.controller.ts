import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Next,
  Post,
  Req,
  Res,
  Session,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto';
import { AuthenticatedRequest, UserDto } from '@joey-games/lib';
import { Response } from 'express';
import { SessionService } from '../session/session.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private eventEmitter: EventEmitter2
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginInfo: LoginDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    let storedSession = await this.sessionService.getStoredSession(req.session.id);

    if (storedSession && loginInfo?.email === storedSession?.user?.email) {
      let user = req.session.user;
      res.send(user);
      return;
    }

    let user: UserDto | undefined = await this.authService.login(loginInfo);
    if (user) {
      req.session.regenerate((err) => {
        if (err) {
          console.log(err);
          return;
        }
        req.session.user = user;
        req.session.save((err) => {
          console.log(err);
          res.send(user);
        });
      });
    } 
  }

  @Post('signup')
  signup(@Body() signupInfo: SignupDto) {
    return this.authService.signup(signupInfo);
  }

  @Get('status')
  getStatus(@Session() session) {
    if (session.user) {
      return session.user;
    }
    throw new UnauthorizedException();
  }

  @Post('logout')
  logout(@Req() req: any, @Res() res: Response) {
    this.eventEmitter.emit("auth.logout", req.session.user)
    req.session.user = null;
    req.session.save((err) => {
      if (err) console.log(err);
      req.session.regenerate(() => res.send('Ok'));
    });
  }
}
