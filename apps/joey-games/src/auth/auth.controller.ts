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
import { UserDto } from '@joey-games/lib';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginInfo: LoginDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    if (req.session.user) {
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
    } else {
      throw new HttpException(
        'The username or password you entered is incorrect',
        HttpStatus.UNAUTHORIZED
      );
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
    req.session.user = null;
    req.session.save((err) => {
      if (err) console.log(err);
      req.session.regenerate(() => res.send('Ok'));
    });
  }
}
