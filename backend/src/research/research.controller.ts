import {
  Controller, Get, Post, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ResearchService } from './research.service.js';
import { CreatePublicationDto, CreateGrantDto, CreateHkiDto } from './dto/create-research.dto.js';

@ApiTags('Research Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('research')
export class ResearchController {
  constructor(private researchService: ResearchService) {}

  // ==================== PUBLICATIONS ====================

  @Get('publications')
  @ApiQuery({ name: 'lecturerId', required: false })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['JOURNAL', 'CONFERENCE', 'BOOK', 'CHAPTER'] })
  @ApiQuery({ name: 'sintaLevel', required: false })
  findAllPublications(
    @Query('lecturerId') lecturerId?: string,
    @Query('year') year?: string,
    @Query('type') type?: string,
    @Query('sintaLevel') sintaLevel?: string,
  ) {
    return this.researchService.findAllPublications({
      lecturerId,
      year: year ? +year : undefined,
      type,
      sintaLevel,
    });
  }

  @Post('publications')
  createPublication(@Body() dto: CreatePublicationDto, @Request() req: { user: { sub: string } }) {
    return this.researchService.createPublication(dto, req.user.sub);
  }

  // ==================== GRANTS ====================

  @Get('grants')
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'year', required: false, type: Number })
  findAllGrants(
    @Query('userId') userId?: string,
    @Query('year') year?: string,
  ) {
    return this.researchService.findAllGrants({
      userId,
      year: year ? +year : undefined,
    });
  }

  @Post('grants')
  createGrant(@Body() dto: CreateGrantDto, @Request() req: { user: { sub: string } }) {
    return this.researchService.createGrant(dto, req.user.sub);
  }

  // ==================== HKI ====================

  @Get('hki')
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'year', required: false, type: Number })
  findAllHki(
    @Query('userId') userId?: string,
    @Query('year') year?: string,
  ) {
    return this.researchService.findAllHki({
      userId,
      year: year ? +year : undefined,
    });
  }

  @Post('hki')
  createHki(@Body() dto: CreateHkiDto, @Request() req: { user: { sub: string } }) {
    return this.researchService.createHki(dto, req.user.sub);
  }
}
