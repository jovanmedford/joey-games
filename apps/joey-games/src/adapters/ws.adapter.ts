import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { sessionMiddleWare } from '../lib/utils';

export class WsAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    options.allowRequest = async (request: any, allowFunction) => {
      if (request.session && request.session.user) {
        return allowFunction(null, true);
      }
      return allowFunction('FORBIDDEN', false);
    };
    let io = new Server(this.httpServer, options);
    io.engine.use(sessionMiddleWare);
    return io;
  }
}
