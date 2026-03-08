import { Module } from '@nestjs/common';
import { CooperationController } from './cooperation.controller.js';
import { CooperationService } from './cooperation.service.js';

@Module({
  controllers: [CooperationController],
  providers: [CooperationService],
})
export class CooperationModule {}
