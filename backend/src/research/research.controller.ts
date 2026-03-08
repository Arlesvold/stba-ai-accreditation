import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ResearchService } from './research.service.js';
import { CreateResearchSummaryDto } from './dto/create-research.dto.js';

@ApiTags('Research Summary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('research')
export class ResearchController {
  constructor(private researchService: ResearchService) {}

  @Get()
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiQuery({ name: 'studyProgramId', required: false })
  @ApiQuery({ name: 'institutionId', required: false })
  findAll(
    @Query('academicYearId') academicYearId?: string,
    @Query('studyProgramId') studyProgramId?: string,
    @Query('institutionId') institutionId?: string,
  ) {
    return this.researchService.findAll({ academicYearId, studyProgramId, institutionId });
  }

  @Post()
  create(@Body() dto: CreateResearchSummaryDto) {
    return this.researchService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateResearchSummaryDto) {
    return this.researchService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.researchService.remove(id);
  }
}