import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GenerateObeDraftDto } from './dto/generate-obe.dto.js';
import { ObeService } from './obe.service.js';

@ApiTags('OBE Document Generator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('obe')
export class ObeController {
  constructor(private obeService: ObeService) {}

  @Post('generate-draft')
  generateDraft(@Body() dto: GenerateObeDraftDto) {
    return this.obeService.generateDraft(dto);
  }
}
