import { IsInt, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateScoreDto {
  @ApiProperty({ example: 85 })
  @IsNumber()
  score: number;

  @ApiPropertyOptional({ example: 'Catatan evaluasi' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateScoreDto {
  @ApiProperty({ example: 1, description: 'Nomor kriteria (1-9)' })
  @IsInt()
  @Min(1)
  @Max(9)
  criteriaNo: number;

  @ApiProperty({ example: 'VMTS' })
  @IsString()
  criteriaName: string;

  @ApiProperty({ example: 85 })
  @IsNumber()
  score: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
