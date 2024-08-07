import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Next,
  Post,
  Req,
  Res,
  Session,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto, UserDto } from './dto';
import { NextFunction, Request, Response } from 'express';

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
      let user = req.session.user
      res.send(user)
      return
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
          console.log(err)
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

  @Post('logout')
  @HttpCode(200)
  logout(
    @Session() session: Record<string, any>,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    session.user = null;
    session.save((err) => {
      if (err) next(err);
      session.regenerate(() => res.redirect('/'));
    });
  }
}
