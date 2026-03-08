import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { BkdService } from './bkd.service.js';
import { CreateBkdDto } from './dto/create-bkd.dto.js';

@ApiTags('BKD Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bkd')
export class BkdController {
  constructor(private bkdService: BkdService) {}

  @Get()
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'year', required: false, type: Number })
  findAll(
    @Query('userId') userId?: string,
    @Query('year') year?: string,
  ) {
    return this.bkdService.findAll({
      userId,
      year: year ? +year : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bkdService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBkdDto, @Request() req: { user: { sub: string } }) {
    return this.bkdService.create(dto, req.user.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateBkdDto) {
    return this.bkdService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bkdService.remove(id);
  }
}
