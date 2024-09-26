import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { INestApplicationContext, Injectable } from '@nestjs/common';
import { SessionService } from '../session/session.service';

export class WsAdapter extends IoAdapter {
  private sessionService: SessionService;

  constructor(app: INestApplicationContext) {
    super(app);
    this.sessionService = app.get(SessionService);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    options.allowRequest = async (request: any, allowFunction) => {
      if (request.session && request.session.user) {
        return allowFunction(null, true);
      }
      return allowFunction('FORBIDDEN', false);
    };
    let io = new Server(this.httpServer, {
      cors: { origin: `${process.env.UI_ORIGIN}`, credentials: true },
    });
    io.engine.use(this.sessionService.getMiddleware());
    return io;
  }
}
