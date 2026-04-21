import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GenerateRpsDraftDto } from './dto/generate-rps.dto.js';
import { RpsService } from './rps.service.js';

@ApiTags('RPS Document Generator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rps')
export class RpsController {
  constructor(private rpsService: RpsService) {}

  @Post('generate-draft')
  generateDraft(@Body() dto: GenerateRpsDraftDto) {
    return this.rpsService.generateDraft(dto);
  }
}
