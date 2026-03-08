import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { IkuService } from './iku.service.js';
import { CreateIkuDto } from './dto/create-iku.dto.js';
import { UpdateIkuDto } from './dto/update-iku.dto.js';

@ApiTags('IKU Performance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('iku')
export class IkuController {
  constructor(private ikuService: IkuService) {}

  @Get()
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiQuery({ name: 'ikuCode', required: false })
  @ApiQuery({ name: 'institutionId', required: false })
  findAll(
    @Query('academicYearId') academicYearId?: string,
    @Query('ikuCode') ikuCode?: string,
    @Query('institutionId') institutionId?: string,
  ) {
    return this.ikuService.findAll({ academicYearId, ikuCode, institutionId });
  }

  @Post()
  create(@Body() dto: CreateIkuDto) {
    return this.ikuService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIkuDto) {
    return this.ikuService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ikuService.remove(id);
  }
}