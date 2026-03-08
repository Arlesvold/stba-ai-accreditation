import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { SpmiService } from './spmi.service.js';
import { CreateSpmiDto } from './dto/create-spmi.dto.js';

@ApiTags('SPMI Monitoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('spmi')
export class SpmiController {
  constructor(private spmiService: SpmiService) {}

  @Get()
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'phase', required: false })
  findAll(
    @Query('year') year?: string,
    @Query('phase') phase?: string,
  ) {
    return this.spmiService.findAll({
      year: year ? +year : undefined,
      phase,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spmiService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSpmiDto) {
    return this.spmiService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateSpmiDto) {
    return this.spmiService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.spmiService.remove(id);
  }
}
