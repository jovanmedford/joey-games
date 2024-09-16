import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { SessionService } from '../session/session.service';

@Injectable()
export class GatewayGuard implements CanActivate {
  constructor(private sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToWs();
    const socket = ctx.getClient();
    const handshakeSession = socket.request.session;
    const store = this.sessionService.getStore();

    if (!handshakeSession) return false;

    const shouldActivate: boolean = await new Promise((resolve, reject) => {
      store.get(handshakeSession.id, (error, currentSession: any) => {
        if (error) {
          return reject(
            new HttpException(
              'Error getting session information.',
              HttpStatus.INTERNAL_SERVER_ERROR
            )
          );
        }

        if (!currentSession || !currentSession.user) {
          resolve(false);
        }

        let user = currentSession.user;
        if (!user) resolve(false);

        return resolve(true);
      });
    });
    return shouldActivate;
  }
}
