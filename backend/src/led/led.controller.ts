import {
  Controller, Get, Post, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { LedService } from './led.service.js';
import { GenerateDocumentDto } from './dto/generate-led.dto.js';

@ApiTags('Document Generation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('led')
export class LedController {
  constructor(private ledService: LedService) {}

  @Post('generate')
  generate(@Body() dto: GenerateDocumentDto, @Request() req: { user: { sub: string } }) {
    return this.ledService.generate(dto, req.user.sub);
  }

  @Get('status/:jobId')
  getStatus(@Param('jobId') jobId: string) {
    return this.ledService.getStatus(jobId);
  }

  @Get('download/:jobId')
  getDownload(@Param('jobId') jobId: string) {
    return this.ledService.getDownload(jobId);
  }

  @Get('jobs')
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAllJobs(
    @Query('institutionId') institutionId?: string,
    @Query('status') status?: string,
  ) {
    return this.ledService.findAllJobs({ institutionId, status });
  }
}