import { IsInt, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIkuDto {
  @ApiProperty({ example: 7, description: 'Nomor kriteria IAPT (1-9)' })
  @IsInt()
  @Min(1)
  @Max(9)
  criteriaNo: number;

  @ApiProperty({ example: 'Jumlah Publikasi Internasional' })
  @IsString()
  indicator: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  target: number;

  @ApiProperty({ example: 14 })
  @IsNumber()
  current: number;

  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  semester?: number;

  @ApiPropertyOptional({ example: 'Catatan tambahan' })
  @IsString()
  @IsOptional()
  notes?: string;
}
