import { Module } from '@nestjs/common';
import { LedController } from './led.controller.js';
import { LedService } from './led.service.js';

@Module({
  controllers: [LedController],
  providers: [LedService],
})
export class LedModule {}
