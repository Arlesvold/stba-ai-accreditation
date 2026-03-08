import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RiskService } from './risk.service.js';
import { CreateValidationDto } from './dto/create-risk.dto.js';

@ApiTags('Validation & Risk')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('risk')
export class RiskController {
  constructor(private riskService: RiskService) {}

  @Get('validations')
  @ApiQuery({ name: 'documentOutputId', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'validationType', required: false })
  findAll(
    @Query('documentOutputId') documentOutputId?: string,
    @Query('severity') severity?: string,
    @Query('validationType') validationType?: string,
  ) {
    return this.riskService.findAll({ documentOutputId, severity, validationType });
  }

  @Post('validations')
  create(@Body() dto: CreateValidationDto) {
    return this.riskService.create(dto);
  }

  @Delete('validations/:id')
  remove(@Param('id') id: string) {
    return this.riskService.remove(id);
  }
}