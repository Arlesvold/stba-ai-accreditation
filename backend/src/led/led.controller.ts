import {
  Controller, Get, Post, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { LedService } from './led.service.js';
import { GenerateDocumentDto } from './dto/generate-led.dto.js';
import { CheckConsistencyDto } from './dto/check-consistency.dto.js';

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

  @Post('mcp/tools/:toolCode')
  executeMcpTool(
    @Param('toolCode') toolCode: string,
    @Body() dto: GenerateDocumentDto | CheckConsistencyDto,
    @Request() req: { user: { sub: string } },
  ): Promise<unknown> {
    return this.ledService.executeMcpTool(toolCode, dto, req.user.sub);
  }

  @Get('status/:jobId')
  getStatus(@Param('jobId') jobId: string) {
    return this.ledService.getStatus(jobId);
  }

  @Get('download/:jobId')
  getDownload(@Param('jobId') jobId: string) {
    return this.ledService.getDownload(jobId);
  }

  @Post('document.check_consistency')
  checkConsistency(
    @Body() dto: CheckConsistencyDto,
    @Request() req: { user: { sub: string } },
  ): Promise<unknown> {
    return this.ledService.checkConsistency(dto, req.user.sub);
  }

  @Get('validation/:documentOutputId')
  @ApiQuery({ name: 'take', required: false })
  getValidationResults(
    @Param('documentOutputId') documentOutputId: string,
    @Query('take') take?: string,
  ) {
    const parsedTake = take ? Number(take) : undefined;
    return this.ledService.getValidationResults(documentOutputId, parsedTake);
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