import { Module } from '@nestjs/common';
import { BkdController } from './bkd.controller.js';
import { BkdService } from './bkd.service.js';

@Module({
  controllers: [BkdController],
  providers: [BkdService],
})
export class BkdModule {}
