import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { RoomMgrService } from '../room-mgr/room-mgr.service';

@Injectable()
export class RoomGuard implements CanActivate {
  constructor(
    private sessionService: SessionService,
    private roomMgr: RoomMgrService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToWs();
    const socket = ctx.getClient();
    const data = ctx.getData();
    const handshakeSession = socket.request.session;
    const store = this.sessionService.getStore();

    const shouldActivate: boolean = await new Promise((resolve, reject) => {
      store.get(handshakeSession.id, (error, currentSession: any) => {
        if (error || !currentSession) {
          reject(
            new HttpException(
              'Error getting session information.',
              HttpStatus.INTERNAL_SERVER_ERROR
            )
          );
        }

        let user = currentSession.user;
        if (!user) resolve(false);

        let room = this.roomMgr.rooms.get(data?.roomId);
        if (!room) resolve(false);

        let playerData = room.players.get(user.email);
        if (!playerData || playerData.status == 'disconnected') resolve(false);

        resolve(true);
      });
    });

    return shouldActivate;
  }
}
