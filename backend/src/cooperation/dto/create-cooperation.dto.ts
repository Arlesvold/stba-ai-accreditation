import { IsString, IsOptional, IsInt, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateServiceSummaryDto {
  @ApiProperty({ example: 'uuid-institution' })
  @IsUUID()
  institutionId: string;

  @ApiPropertyOptional({ example: 'uuid-study-program' })
  @IsUUID()
  @IsOptional()
  studyProgramId?: string;

  @ApiProperty({ example: 'uuid-academic-year' })
  @IsUUID()
  academicYearId: string;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @IsOptional()
  programsTotal?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsInt()
  @IsOptional()
  partnersTotal?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsInt()
  @IsOptional()
  outputsTotal?: number;
}

export class UpdateServiceSummaryDto extends PartialType(CreateServiceSummaryDto) {}