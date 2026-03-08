import { Module } from '@nestjs/common';
import { SpmiController } from './spmi.controller.js';
import { SpmiService } from './spmi.service.js';

@Module({
  controllers: [SpmiController],
  providers: [SpmiService],
})
export class SpmiModule {}
