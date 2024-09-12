import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Socket as ClientSocket, io } from 'socket.io-client';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import session from 'express-session';
import { ClientToServerEvents, ServerToClientEvents } from '../lib/types';
import { MultiplayerGatewayGateway } from '../gateway/multiplayer-gateway.gateway';
import { AppModule } from '../app/app.module';
import request from 'supertest';

let testSessionMiddleWare = session({
  name: 'test',
  secret: 'TEST',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
  },
});

class TestAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    options.allowRequest = async (request: any, allowFunction) => {
      if (request.session && request.session.user) {
        return allowFunction(null, true);
      }
      return allowFunction('FORBIDDEN', false);
    };
    let io = new Server(this.httpServer, options);
    io.engine.use(testSessionMiddleWare);
    return io;
  }
}

describe('MultiplayerGatewayGateway', () => {
  let app: INestApplication;
  let client: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
  let server: Server;
  let testUser = {
    email: 'joey@games.com',
    password: process.env.JOEY_PASSWORD,
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(testSessionMiddleWare);
    const adapter = new TestAdapter(app.getHttpServer());
    app.useWebSocketAdapter(adapter);
    await app.init();
    server = app.get(MultiplayerGatewayGateway).server;
    server.engine.use(testSessionMiddleWare);
    app.listen(3000);
  });

  afterAll(() => {
    app.close();
  });

  it('should block handshake if not logged in', (done) => {
    client = io('http://localhost:3000');
    client.on('connect_error', (err) => {
      expect(err).toBeDefined()
      client.disconnect()
      done();
    });
  });

  it('should connect if logged in', (done) => {
    request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .then((response) => {
        expect(response.status).toBe(200);
        const cookie = response.headers['set-cookie'][0];
        client = io('http://localhost:3000', {
          extraHeaders: {
            Cookie: cookie,
          },
        });
        server.on('connection', (socket: any) => {
          expect(socket.request.session.user.email).toBe(testUser.email);
          client.disconnect()
          done();
        });
      });
  });
});
