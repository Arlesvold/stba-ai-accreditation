import { Module } from '@nestjs/common';
import { ConsistencyCheckerController } from './consistency-checker.controller.js';
import { ConsistencyCheckerService } from './consistency-checker.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ConsistencyCheckerController],
  providers: [ConsistencyCheckerService],
})
export class ConsistencyCheckerModule {}
