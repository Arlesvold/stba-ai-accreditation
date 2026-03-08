import { IsInt, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentsSummaryDto {
  @ApiProperty()
  @IsUUID()
  institutionId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  studyProgramId?: string;

  @ApiProperty()
  @IsUUID()
  academicYearId: string;

  @ApiPropertyOptional({ example: 200 })
  @IsInt()
  @IsOptional()
  @Min(0)
  applicantsTotal?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsInt()
  @IsOptional()
  @Min(0)
  newStudentsTotal?: number;

  @ApiPropertyOptional({ example: 350 })
  @IsInt()
  @IsOptional()
  @Min(0)
  activeStudentsTotal?: number;

  @ApiPropertyOptional({ example: 5.2 })
  @IsNumber()
  @IsOptional()
  dropoutRatePct?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsInt()
  @IsOptional()
  @Min(0)
  studentAchievementsTotal?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsInt()
  @IsOptional()
  @Min(0)
  mbkmStudentsTotal?: number;
}

export class CreateGraduatesDto {
  @ApiProperty()
  @IsUUID()
  institutionId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  studyProgramId?: string;

  @ApiProperty()
  @IsUUID()
  academicYearId: string;

  @ApiPropertyOptional({ example: 3.45 })
  @IsNumber()
  @IsOptional()
  avgGpa?: number;

  @ApiPropertyOptional({ example: 4.2 })
  @IsNumber()
  @IsOptional()
  avgStudyPeriodYears?: number;

  @ApiPropertyOptional({ example: 3.5 })
  @IsNumber()
  @IsOptional()
  employmentWaitMonths?: number;

  @ApiPropertyOptional({ example: 78.5 })
  @IsNumber()
  @IsOptional()
  fieldAlignmentPct?: number;

  @ApiPropertyOptional({ example: 12.0 })
  @IsNumber()
  @IsOptional()
  continuingStudyPct?: number;
}