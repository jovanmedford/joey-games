import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto, SignupDto } from './dto';
import { userExistsMessage } from '../lib/constants';

@Injectable()
export class AuthService {
  login(loginInfo: LoginDto) {
    return loginInfo;
  }

  signup(signupInfo: SignupDto) {
    return signupInfo;
  }
}
