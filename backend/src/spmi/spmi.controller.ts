import {
  Controller, Get, Post, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { SpmiService } from './spmi.service.js';
import { CreateChangeLogDto } from './dto/create-spmi.dto.js';

@ApiTags('Audit Trail')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('spmi')
export class SpmiController {
  constructor(private spmiService: SpmiService) {}

  @Get()
  @ApiQuery({ name: 'entityName', required: false })
  @ApiQuery({ name: 'changeType', required: false })
  findAll(
    @Query('entityName') entityName?: string,
    @Query('changeType') changeType?: string,
  ) {
    return this.spmiService.findAll({ entityName, changeType });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spmiService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateChangeLogDto) {
    return this.spmiService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.spmiService.remove(id);
  }
}