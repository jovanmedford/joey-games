import { Test, TestingModule } from '@nestjs/testing';
import { RoomMgrService } from './room-mgr.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PlayerData, Room, Success } from '@joey-games/lib';

describe('RoomMgrService - room created successfully', () => {
  let roomMgr: RoomMgrService;
  let newRoomId: string;
  let host: string;
  let addHostResult;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [RoomMgrService],
    }).compile();

    roomMgr = module.get<RoomMgrService>(RoomMgrService);
    host = 'joey@games.com';
    addHostResult = (await roomMgr.createRoom(
      host
    )) as unknown as Success<Room>;
    ({ id: newRoomId } = addHostResult.data);
  });

  it('createRoom should add host', async () => {
    let newRoom = roomMgr.rooms.get(newRoomId);
    expect(newRoom).toBeDefined();
    let foundPlayer = newRoom.players.get(host);
    expect(foundPlayer).toBeDefined();
    expect(foundPlayer.email).toBe(host);
    expect(foundPlayer.status).toBe('ready');
  });

  it('should add dij@games.com', async () => {
    let newEmail = 'dij@games.com';
    let { data: player } = (await roomMgr.addPlayerToRoomData(
      newRoomId,
      newEmail
    )) as Success<PlayerData>;
    let newRoom = roomMgr.rooms.get(newRoomId);
    expect(newRoom).toBeDefined();
    let foundPlayer = newRoom.players.get(player.email);
    expect(foundPlayer).toBeDefined();
    expect(foundPlayer.email).toBe(newEmail);
    expect(foundPlayer.status).toBe('inactive');
  });
});

describe('RoomMgrService - room creation failed', () => {
  let roomMgr: RoomMgrService;
  let host: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [RoomMgrService],
    }).compile();

    roomMgr = module.get<RoomMgrService>(RoomMgrService);
    host = 'joey@games.com';
  });

  it('should get rid of room if adding host fails', async () => {
    let host: string = 'joey@games.com';
    jest
      .spyOn(roomMgr, 'addPlayerToRoomData')
      .mockReturnValue(
        new Promise((resolve) =>
          resolve({ success: false, message: 'Player not found.' })
        )
      );
    let result = (await roomMgr.createRoom(host)) as unknown as Success<Room>;
    expect(result.success).toBeFalsy();
    expect(roomMgr.rooms.size).toBe(0);
  });
});
