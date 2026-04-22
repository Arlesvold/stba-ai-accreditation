import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AccreditationService } from './accreditation.service.js';
import {
  CreateVmtsDto,
  CreateScoreDto,
  UpdateVmtsDto,
  UpdateScoreDto,
} from './dto/accreditation.dto.js';

@ApiTags('Accreditation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(['accreditation', 'v1/accreditation'])
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

  @Get('readiness')
  getReadiness(@Query('year') year?: string) {
    const yearNumber = year ? Number(year) : undefined;
    const parsedYear =
      typeof yearNumber === 'number' && Number.isFinite(yearNumber)
        ? yearNumber
        : undefined;
    return this.accreditationService.getReadiness(parsedYear);
  }

  @Get('readiness/:institutionId')
  getLegacyReadiness(@Param('institutionId') institutionId: string) {
    return this.accreditationService.getLegacyReadiness(institutionId);
  }

  @Post('scores')
  createScore(@Body() dto: CreateScoreDto) {
    return this.accreditationService.createScore(dto);
  }

  @Put('scores/:id')
  updateScore(@Param('id') id: string, @Body() dto: UpdateScoreDto) {
    return this.accreditationService.updateScore(id, dto);
  }
}