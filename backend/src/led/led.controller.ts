import {
  Controller, Get, Post, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { LedService } from './led.service.js';
import { GenerateLedDto } from './dto/generate-led.dto.js';

@ApiTags('LED Auto-Generator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('led')
export class LedController {
  constructor(private ledService: LedService) {}

  @Post('generate')
  generate(@Body() dto: GenerateLedDto, @Request() req: { user: { sub: string } }) {
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
}
