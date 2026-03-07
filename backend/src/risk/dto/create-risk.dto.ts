import { IsEnum, IsInt, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AlertLevelDto {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CreateRiskAlertDto {
  @ApiProperty({ example: 7, description: 'Nomor kriteria (1-9)' })
  @IsInt()
  @Min(1)
  @Max(9)
  criteriaNo: number;

  @ApiProperty({ enum: AlertLevelDto, example: 'HIGH' })
  @IsEnum(AlertLevelDto)
  level: AlertLevelDto;

  @ApiProperty({ example: 'Publikasi internasional 40% di bawah target' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: 'Perlu 6 publikasi tambahan sebelum deadline' })
  @IsString()
  @IsOptional()
  recommendation?: string;
}
