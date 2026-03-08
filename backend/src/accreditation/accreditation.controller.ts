import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AccreditationService } from './accreditation.service.js';
import { CreateVmtsDto, UpdateVmtsDto } from './dto/accreditation.dto.js';

@ApiTags('Accreditation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accreditation')
export class AccreditationController {
  constructor(private accreditationService: AccreditationService) {}

  @Get('vmts')
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'studyProgramId', required: false })
  getVmts(
    @Query('institutionId') institutionId?: string,
    @Query('studyProgramId') studyProgramId?: string,
  ) {
    return this.accreditationService.getVmts({ institutionId, studyProgramId });
  }

  @Post('vmts')
  createVmts(@Body() dto: CreateVmtsDto) {
    return this.accreditationService.createVmts(dto);
  }

  @Put('vmts/:id')
  updateVmts(@Param('id') id: string, @Body() dto: UpdateVmtsDto) {
    return this.accreditationService.updateVmts(id, dto);
  }

  @Get('readiness/:institutionId')
  getReadiness(@Param('institutionId') institutionId: string) {
    return this.accreditationService.getReadiness(institutionId);
  }
}