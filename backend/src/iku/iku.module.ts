import { Module } from '@nestjs/common';
import { IkuController } from './iku.controller.js';
import { IkuService } from './iku.service.js';

@Module({
  controllers: [IkuController],
  providers: [IkuService],
})
export class IkuModule {}
