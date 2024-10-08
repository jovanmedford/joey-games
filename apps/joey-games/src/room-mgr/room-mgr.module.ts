import { Module } from '@nestjs/common';
import { RoomMgrService } from './room-mgr.service';

@Module({
  providers: [RoomMgrService],
  exports: [RoomMgrService],
})
export class RoomMgrModule {}
