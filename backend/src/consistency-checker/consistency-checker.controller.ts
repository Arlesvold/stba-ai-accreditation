import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ConsistencyCheckerService } from './consistency-checker.service.js';
import { RunConsistencyCheckDto } from './dto/run-consistency-check.dto.js';

@ApiTags('Consistency Checker')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/consistency')
export class ConsistencyCheckerController {
  constructor(private readonly consistencyCheckerService: ConsistencyCheckerService) {}

  @Post('check')
  runCheck(@Body() dto: RunConsistencyCheckDto) {
    return this.consistencyCheckerService.runCheck(dto);
  }

  @Get('history')
  getHistory(@Query('limit') limit?: string) {
    const normalized = Number(limit ?? 10);
    const safeLimit = Number.isNaN(normalized) ? 10 : Math.max(1, Math.min(20, normalized));
    return this.consistencyCheckerService.getHistory(safeLimit);
  }
}
