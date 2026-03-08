import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CooperationService } from './cooperation.service.js';
import { CreateCooperationDto } from './dto/create-cooperation.dto.js';

@ApiTags('Kerjasama / MoU')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cooperation')
export class CooperationController {
  constructor(private cooperationService: CooperationService) {}

  @Get()
  @ApiQuery({ name: 'scope', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('scope') scope?: string,
    @Query('status') status?: string,
  ) {
    return this.cooperationService.findAll({ scope, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cooperationService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCooperationDto) {
    return this.cooperationService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateCooperationDto) {
    return this.cooperationService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cooperationService.remove(id);
  }
}
