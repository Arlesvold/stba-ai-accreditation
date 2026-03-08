import { IsString, IsInt, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpmiDto {
  @ApiProperty({ example: 'Evaluasi Kurikulum 2024' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;

  @ApiProperty({ example: 'PENETAPAN', enum: ['PENETAPAN', 'PELAKSANAAN', 'EVALUASI', 'PENGENDALIAN', 'PENINGKATAN'] })
  @IsEnum({ PENETAPAN: 'PENETAPAN', PELAKSANAAN: 'PELAKSANAAN', EVALUASI: 'EVALUASI', PENGENDALIAN: 'PENGENDALIAN', PENINGKATAN: 'PENINGKATAN' })
  phase: 'PENETAPAN' | 'PELAKSANAAN' | 'EVALUASI' | 'PENGENDALIAN' | 'PENINGKATAN';

  @ApiPropertyOptional({ example: 'Evaluasi mutu kurikulum prodi Sastra Inggris' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'IN_PROGRESS' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-06-30' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Ditemukan gap pada capaian IKU 3' })
  @IsString()
  @IsOptional()
  findings?: string;

  @ApiPropertyOptional({ example: 'Revisi RPS dan peningkatan monitoring' })
  @IsString()
  @IsOptional()
  followUp?: string;
}
