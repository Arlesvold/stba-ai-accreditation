import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { BkdService } from './bkd.service.js';
import { CreateLecturersSummaryDto } from './dto/create-bkd.dto.js';

@ApiTags('Lecturers Summary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bkd')
export class BkdController {
  constructor(private bkdService: BkdService) {}

  @Get()
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'studyProgramId', required: false })
  findAll(
    @Query('academicYearId') academicYearId?: string,
    @Query('institutionId') institutionId?: string,
    @Query('studyProgramId') studyProgramId?: string,
  ) {
    return this.bkdService.findAll({ academicYearId, institutionId, studyProgramId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bkdService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLecturersSummaryDto) {
    return this.bkdService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateLecturersSummaryDto) {
    return this.bkdService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bkdService.remove(id);
  }
}