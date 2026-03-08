import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CooperationService } from './cooperation.service.js';
import { CreateServiceSummaryDto, UpdateServiceSummaryDto } from './dto/create-cooperation.dto.js';

@ApiTags('Service / Pengabdian')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cooperation')
export class CooperationController {
  constructor(private cooperationService: CooperationService) {}

  @Get()
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'academicYearId', required: false })
  findAll(
    @Query('institutionId') institutionId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.cooperationService.findAll({ institutionId, academicYearId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cooperationService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateServiceSummaryDto) {
    return this.cooperationService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceSummaryDto) {
    return this.cooperationService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cooperationService.remove(id);
  }
}