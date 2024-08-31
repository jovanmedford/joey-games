import { Test, TestingModule } from '@nestjs/testing';
import { RoomMgrService } from './room-mgr.service';

describe('RoomMgrService', () => {
  let service: RoomMgrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomMgrService],
    }).compile();

    service = module.get<RoomMgrService>(RoomMgrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
