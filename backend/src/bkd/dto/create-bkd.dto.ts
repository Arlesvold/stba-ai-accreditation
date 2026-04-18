import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLecturersSummaryDto {
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

  @ApiPropertyOptional({ example: 20 })
  @IsInt()
  @IsOptional()
  @Min(0)
  permanentCount?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @IsOptional()
  @Min(0)
  nonPermanentCount?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsInt()
  @IsOptional()
  @Min(0)
  mastersCount?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @IsOptional()
  @Min(0)
  doctoralCount?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Min(0)
  professorCount?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @IsOptional()
  @Min(0)
  associateProfessorCount?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsInt()
  @IsOptional()
  @Min(0)
  lecturerCertifiedCount?: number;
}