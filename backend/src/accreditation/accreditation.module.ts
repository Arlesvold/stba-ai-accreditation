import { Module } from '@nestjs/common';
import { AccreditationController } from './accreditation.controller.js';
import { AccreditationService } from './accreditation.service.js';

@Module({
  controllers: [AccreditationController],
  providers: [AccreditationService],
})
export class AccreditationModule {}
