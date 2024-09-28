/**
 * Test that a user can create a room, send an invite and pass a message to the room
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Socket as ClientSocket, io } from 'socket.io-client';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import session from 'express-session';
import { ClientToServerEvents, ServerToClientEvents } from '@joey-games/lib';
import { MultiplayerGateway } from '../gateway/multiplayer.gateway';
import { AppModule } from '../app/app.module';
import request from 'supertest';
import { SessionService } from '../session/session.service';
import createMemoryStore from 'memorystore';

const MemoryStore = createMemoryStore(session);
let store = new MemoryStore({
  checkPeriod: 86400000,
});
let testSessionMiddleWare = session({
  name: 'test',
  secret: 'TEST',
  resave: false,
  store: store,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
  },
});

class TestAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    let io = new Server(this.httpServer, options);
    io.engine.use(testSessionMiddleWare);
    return io;
  }
}

describe('Invitation Tests', () => {
  let app: INestApplication;
  let server: Server;
  let hostClient: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
  let responderClient: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
  let hostUser = {
    email: 'joey@games.com',
    password: process.env.JOEY_PASSWORD,
  };
  let responderUser = {
    email: 'dij@games.com',
    password: process.env.DIJ_PASSWORD,
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({
      logger: ['debug'],
    });
    let sessionService = app.get(SessionService);
    jest.spyOn(sessionService, 'getStore').mockImplementation(() => store);
    jest
      .spyOn(sessionService, 'getMiddleware')
      .mockImplementation(() => testSessionMiddleWare);
    const adapter = new TestAdapter(app.getHttpServer());
    app.use(sessionService.getMiddleware());
    app.useWebSocketAdapter(adapter);
    await app.init();
    server = app.get(MultiplayerGateway).server;
    server.engine.use(testSessionMiddleWare);
    app.listen(3000);
  });

  beforeEach(async () => {
    const hostAgent = request.agent(app.getHttpServer());
    const responderAgent = request.agent(app.getHttpServer());

    const [hostLoginResponse, responderLoginResponse] = await Promise.all([
      hostAgent.post('/auth/login').send(hostUser),
      responderAgent.post('/auth/login').send(responderUser),
    ]);

    let hostCookie = hostLoginResponse.headers['set-cookie'][0];
    let responderCookie = responderLoginResponse.headers['set-cookie'][0];

    hostClient = io('http://localhost:3000', {
      extraHeaders: { Cookie: hostCookie },
    });
    responderClient = io('http://localhost:3000', {
      extraHeaders: { Cookie: responderCookie },
    });
  });

  afterEach(() => {
    hostClient.disconnect();
    responderClient.disconnect();
  });

  afterAll(() => {
    app.close();
  });

  it('should complete the invitation flow', (done) => {
    hostClient.on('connect', () => {
      hostClient.emit('send_invitation', responderUser.email);
      responderClient.on('invited', (invitation) => {
        expect(invitation.roomId).toBeDefined();
        expect(invitation.to).toBe(responderUser.email);
        responderClient.emit('reply_to_invitation', {
          invitationId: invitation.id,
          roomId: invitation.roomId,
          status: 'accepted',
        });
      });
      hostClient.on("joined", (message) => {
        hostClient.emit('send_invitation', responderUser.email);
        expect(message).toContain("Hey")
        done();
      })
    });
  });
});
