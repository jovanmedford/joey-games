/**
 * Test that a user can create a room, send an invite and pass a message to the room
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Socket as client, io } from 'socket.io-client';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import session from 'express-session';
import { ClientToServerEvents, ServerToClientEvents } from '@joey-games/lib';
import { MultiplayerGateway } from '../gateway/multiplayer.gateway';
import { AppModule } from '../app/app.module';
import request from 'supertest';
import { SessionService } from '../session/session.service';
import createMemoryStore from 'memorystore';
import { RoomMgrService } from '../room-mgr/room-mgr.service';
import { Room } from '@joey-games/lib';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
    let io = new Server(this.httpServer, {
      ...options,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: false,
      },
    });
    io.engine.use(testSessionMiddleWare);
    return io;
  }
}

describe('Invitation Tests', () => {
  let app: INestApplication;
  let server: Server;
  let client: client<ServerToClientEvents, ClientToServerEvents>;
  let roomId: string;
  let gateway: MultiplayerGateway;
  let emitter: EventEmitter2;
  let roomMgr: RoomMgrService;
  let timeout: NodeJS.Timeout;
  let interval: NodeJS.Timer;

  let user = {
    email: 'joey@games.com',
    password: process.env.JOEY_PASSWORD,
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
    gateway = app.get(MultiplayerGateway);
    emitter = app.get(EventEmitter2);
    server = gateway.server;
    server.engine.use(testSessionMiddleWare);
    app.listen(3000);
  });

  beforeEach(async () => {
    // Login
    const agent = request.agent(app.getHttpServer());
    const loginResponse = await agent.post('/auth/login').send(user);
    let cookie = loginResponse.headers['set-cookie'][0];
    client = io('http://localhost:3000', {
      extraHeaders: { Cookie: cookie },
      reconnectionDelay: 10000,
      reconnectionDelayMax: 10000,
    });

    roomMgr = app.get(RoomMgrService);
    let result = await roomMgr.createRoom(user.email);
    roomId = result.success ? result.data.id : null;
  });

  afterEach(() => {
    client.disconnect();
  });

  afterAll(async () => {
    console.log('cleanup');
    app.close();
  });

  it.only(
    'should handle reconnect after temporary disconnect',
    (done) => {
      client.on('connect', () => {
        console.log(`Client ${client.id}`);
        if (!client.recovered) {
          client.emit('join_room', { roomId });
          timeout = setTimeout(() => {
            client.io.engine.close();
            console.log('CLOSED');
          }, Math.random() * 5000 + 1000);
        }
      });

      emitter.on('client.recovered', (serverClient) => {
        console.log('TEST RECOVERED');
        let room = roomMgr.getRoom(roomId);
        clearInterval(interval);
        expect(serverClient.rooms.has(room.id)).toBeTruthy();
        expect(room.players.get(user.email).status).toBe('connected');
        expect(gateway.disconnectionMap.has(serverClient.id)).toBeFalsy();
        done();
      });

      emitter.on('client.inactive', (serverClient) => {
        console.log('TEST DISCONNECTED');
        let room = roomMgr.getRoom(roomId);
        expect(room.players.get(user.email).status).toBe('inactive');
        expect(gateway.disconnectionMap.has(serverClient.id)).toBeTruthy();
      });

      interval = setInterval(() => {
        server.emit('pong', new Date().toISOString());
      }, 1000);
    },
    60 * 1000
  );
});
