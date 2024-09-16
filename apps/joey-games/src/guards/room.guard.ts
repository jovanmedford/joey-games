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

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToWs();
    const socket = ctx.getClient();
    const data = ctx.getData();
    const handshakeSession = socket.request.session;
    const store = this.sessionService.getStore();

    if (!handshakeSession) return false;

    store.get(handshakeSession.id, (error, currentSession: any) => {
      if (error || !currentSession) {
        throw new HttpException(
          'Error getting session information.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      let user = currentSession.user;
      if (!user) return false;

      let room = this.roomMgr.rooms.get(data?.roomId);
      if (!room) return false;

      let playerData = room.players.get(user.email);
      if (!playerData || playerData.status == 'declined') return false;

      return true;
    });
  }
}
