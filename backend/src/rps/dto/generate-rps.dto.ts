import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RpsCloItemDto {
  @ApiProperty({ example: 'CLO-1' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Mahasiswa mampu menyusun outline dan struktur esai akademik yang jelas' })
  @IsString()
  clo: string;

  @ApiProperty({ example: 'C4 (Analyze)' })
  @IsString()
  taxonomyLevel: string;

  @ApiProperty({ example: 'Outline lengkap dengan thesis statement' })
  @IsString()
  indicator: string;
}

export class RpsWeeklyPlanItemDto {
  @ApiProperty({ example: '2-3' })
  @IsString()
  week: string;

  @ApiProperty({ example: 'Thesis Statement & Essay Structure' })
  @IsString()
  topicSubtopic: string;

  @ApiProperty({ example: 'Case Study + Group Work' })
  @IsString()
  learningMethod: string;

  @ApiProperty({ example: '3 x 50 menit' })
  @IsString()
  duration: string;

  @ApiProperty({ example: 'Outline Submission (10%)' })
  @IsString()
  assessment: string;
}

export class RpsAssessmentDto {
  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(0)
  @Max(100)
  utsPercent: number;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(0)
  @Max(100)
  uasPercent: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(0)
  @Max(100)
  assignmentPortfolioPercent: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  @Max(100)
  participationReflectionPercent: number;
}

export class GenerateRpsDraftDto {
  @ApiPropertyOptional({ example: 'Academic Writing' })
  @IsOptional()
  @IsString()
  courseName?: string;

  @ApiPropertyOptional({ example: 'ENG-301' })
  @IsOptional()
  @IsString()
  courseCode?: string;

  @ApiPropertyOptional({ example: 'S1 Sastra Inggris' })
  @IsOptional()
  @IsString()
  programStudy?: string;

  @ApiPropertyOptional({ example: '3 (Ganjil)' })
  @IsOptional()
  @IsString()
  semester?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  sks?: number;

  @ApiPropertyOptional({ example: '2026/2027' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ example: '19 April 2026' })
  @IsOptional()
  @IsString()
  generatedDate?: string;

  @ApiPropertyOptional({ example: '1.0' })
  @IsOptional()
  @IsString()
  draftVersion?: string;

  @ApiPropertyOptional({
    example:
      'Mata kuliah ini membekali mahasiswa dengan kemampuan menulis akademik yang efektif, mulai dari perencanaan hingga penyusunan esai dan paper ilmiah.',
  })
  @IsOptional()
  @IsString()
  courseDescription?: string;

  @ApiPropertyOptional({ type: [String], example: ['English Grammar', 'Paragraph Writing'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsInt()
  @Min(8)
  @Max(20)
  totalWeeks?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsInt()
  @Min(0)
  evidenceCount?: number;

  @ApiPropertyOptional({ type: [RpsCloItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RpsCloItemDto)
  clos?: RpsCloItemDto[];

  @ApiPropertyOptional({ type: [RpsWeeklyPlanItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RpsWeeklyPlanItemDto)
  weeklyPlan?: RpsWeeklyPlanItemDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningResources?: string[];

  @ApiPropertyOptional({ type: RpsAssessmentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RpsAssessmentDto)
  finalAssessment?: RpsAssessmentDto;
}
