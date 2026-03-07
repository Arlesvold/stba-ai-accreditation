import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AccreditationService } from './accreditation.service.js';
import { CreateScoreDto, UpdateScoreDto } from './dto/accreditation.dto.js';

@ApiTags('Accreditation Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accreditation')
export class AccreditationController {
  constructor(private accreditationService: AccreditationService) {}

  @Get('readiness')
  @ApiQuery({ name: 'year', required: false, type: Number })
  getReadiness(@Query('year') year?: string) {
    return this.accreditationService.getReadiness(year ? +year : undefined);
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
