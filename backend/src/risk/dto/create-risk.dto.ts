import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateValidationDto {
  @ApiProperty()
  @IsUUID()
  documentOutputId: string;

  @ApiProperty({ example: 'COMPLETENESS' })
  @IsString()
  validationType: string;

  @ApiProperty({ example: 'WARNING', enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'] })
  @IsString()
  severity: string;

  @ApiPropertyOptional({ example: 'RULE-001' })
  @IsString()
  @IsOptional()
  ruleCode?: string;

  @ApiProperty({ example: 'Data dosen belum lengkap untuk kriteria 4' })
  @IsString()
  message: string;
}