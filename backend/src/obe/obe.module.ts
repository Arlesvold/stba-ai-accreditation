import { Module } from '@nestjs/common';
import { ObeController } from './obe.controller.js';
import { ObeService } from './obe.service.js';

@Module({
  controllers: [ObeController],
  providers: [ObeService],
})
export class ObeModule {}
