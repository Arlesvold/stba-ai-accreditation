import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResearchSummaryDto {
  @ApiProperty()
  @IsString()
  institutionId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  studyProgramId?: string;

  @ApiProperty()
  @IsString()
  academicYearId: string;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @IsOptional()
  @Min(0)
  grantsTotal?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsInt()
  @IsOptional()
  @Min(0)
  publicationsTotal?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @IsOptional()
  @Min(0)
  scopusTotal?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @IsOptional()
  @Min(0)
  iprTotal?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsInt()
  @IsOptional()
  @Min(0)
  citationTotal?: number;
}