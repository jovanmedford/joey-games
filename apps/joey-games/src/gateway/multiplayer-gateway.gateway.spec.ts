import { Test, TestingModule } from '@nestjs/testing';
import { MultiplayerGatewayGateway } from './multiplayer-gateway.gateway';

describe('MultiplayerGatewayGateway', () => {
  let gateway: MultiplayerGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MultiplayerGatewayGateway],
    }).compile();

    gateway = module.get<MultiplayerGatewayGateway>(MultiplayerGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
