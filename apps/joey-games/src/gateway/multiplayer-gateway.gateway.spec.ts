import { Test, TestingModule } from '@nestjs/testing';
import { MultiplayerGatewayGateway } from './multiplayer-gateway.gateway';
import { INestApplication } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';

describe('MultiplayerGatewayGateway', () => {
  let gateway: MultiplayerGatewayGateway;
  let app: INestApplication;
  let ioClient: Socket;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MultiplayerGatewayGateway],
    }).compile();

    gateway = module.get<MultiplayerGatewayGateway>(MultiplayerGatewayGateway);
    app = module.createNestApplication();

    ioClient = io('http://localhost:3000');

    app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
    ioClient.close()
  });

  describe('Multiplayer Gateway', () => {
    it('should emit pong on ping', async () => {
      ioClient.connect();
      ioClient.emit('ping', 'Hello world!');
      ioClient.on('connect', () => {
        console.log('connected');
      });
      ioClient.on('pong', (data) => {
        expect(data).toBe('Hello world!');
      });
      ioClient.disconnect()
    });
  });
});
