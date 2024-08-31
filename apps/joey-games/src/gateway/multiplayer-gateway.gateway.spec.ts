import { Test, TestingModule } from '@nestjs/testing';
import { MultiplayerGatewayGateway } from './multiplayer-gateway.gateway';
import { INestApplication } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('MultiplayerGatewayGateway', () => {
  let gateway: MultiplayerGatewayGateway;
  let app: INestApplication;
  let clientSocket: Socket;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [MultiplayerGatewayGateway],
    }).compile();

    gateway = module.get<MultiplayerGatewayGateway>(MultiplayerGatewayGateway);
    app = module.createNestApplication();
    app.listen(3000);
  });

  beforeEach(() => {
    clientSocket = io('http://localhost:3000');
  });

  afterEach(() => {
    clientSocket.disconnect();
  });

  afterAll(() => {
    app.close();
  });

  it('should emit pong on ping', (done) => {
    clientSocket.emit('ping', 'Hello World!');
    clientSocket.on('pong', (data) => {
      expect(data).toBe('Hello World!');
      done();
    });
  });
});
