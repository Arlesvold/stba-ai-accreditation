import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RiskService } from './risk.service.js';
import { CreateRiskAlertDto } from './dto/create-risk.dto.js';

@ApiTags('Risk Alert')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('risk')
export class RiskController {
  constructor(private riskService: RiskService) {}

  @Get('alerts')
  @ApiQuery({ name: 'level', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiQuery({ name: 'isResolved', required: false, type: Boolean })
  @ApiQuery({ name: 'criteriaNo', required: false, type: Number })
  findAllAlerts(
    @Query('level') level?: string,
    @Query('isResolved') isResolved?: string,
    @Query('criteriaNo') criteriaNo?: string,
  ) {
    return this.riskService.findAllAlerts({
      level,
      isResolved: isResolved !== undefined ? isResolved === 'true' : undefined,
      criteriaNo: criteriaNo ? +criteriaNo : undefined,
    });
  }

  @Post('alerts')
  createAlert(@Body() dto: CreateRiskAlertDto) {
    return this.riskService.createAlert(dto);
  }

  @Put('alerts/:id/resolve')
  resolveAlert(@Param('id') id: string) {
    return this.riskService.resolveAlert(id);
  }
}
