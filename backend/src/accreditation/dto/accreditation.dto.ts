import {
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  Min,
  IsNumber,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateVmtsDto {
  @ApiProperty()
  @IsUUID()
  institutionId!: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  studyProgramId?: string;

  @ApiProperty({ example: 'Menjadi institusi bahasa asing terkemuka' })
  @IsString()
  vision!: string;

  @ApiProperty({ example: 'Menyelenggarakan pendidikan bahasa yang bermutu' })
  @IsString()
  mission!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  goals?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  strategies?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  versionNo?: number;
}

export class UpdateVmtsDto extends PartialType(CreateVmtsDto) {}

export class CreateScoreDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  criteriaNo!: number;

  @ApiProperty({ example: 'Visi, Misi, Tujuan dan Strategi' })
  @IsString()
  criteriaName!: string;

  @ApiProperty({ example: 72.5 })
  @IsNumber()
  @Min(0)
  score!: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxScore?: number;

  @ApiPropertyOptional({ example: 2026 })
  @IsInt()
  @IsOptional()
  @Min(2000)
  @Max(3000)
  year?: number;

  @ApiPropertyOptional({ example: 'Data awal hasil pemetaan internal.' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateScoreDto {
  @ApiProperty({ example: 84.5 })
  @IsNumber()
  @Min(0)
  score!: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxScore?: number;

  @ApiPropertyOptional({ example: 'Perlu peningkatan pada bukti luaran penelitian.' })
  @IsString()
  @IsOptional()
  notes?: string;
}