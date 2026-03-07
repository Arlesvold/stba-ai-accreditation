import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
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
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'criteria', required: false, type: Number })
  @ApiQuery({ name: 'semester', required: false, type: Number })
  findAll(
    @Query('year') year?: string,
    @Query('criteria') criteria?: string,
    @Query('semester') semester?: string,
  ) {
    return this.ikuService.findAll({
      year: year ? +year : undefined,
      criteria: criteria ? +criteria : undefined,
      semester: semester ? +semester : undefined,
    });
  }

  @Post()
  create(@Body() dto: CreateIkuDto, @Request() req: { user: { sub: string } }) {
    return this.ikuService.create(dto, req.user.sub);
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
