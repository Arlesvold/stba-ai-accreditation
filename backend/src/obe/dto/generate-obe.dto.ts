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

export class GraduateProfileItemDto {
  @ApiProperty({ example: 'Profesional komunikator bahasa Inggris di bidang pendidikan, penerjemahan, dan industri kreatif.' })
  @IsString()
  description: string;
}

export class PloItemDto {
  @ApiProperty({ example: 'PLO-1' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Kemampuan Berbahasa Inggris Tingkat Lanjut' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Mahasiswa mampu berkomunikasi lisan dan tulis dalam bahasa Inggris pada level C1 CEFR.' })
  @IsString()
  description: string;
}

export class CourseMappingItemDto {
  @ApiProperty({ example: 'Academic Writing' })
  @IsString()
  courseName: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  sks: number;

  @ApiProperty({ example: 'Mahasiswa dapat menulis esai akademik yang koheren' })
  @IsString()
  cloUtama: string;

  @ApiProperty({ example: ['PLO-1', 'PLO-3'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  ploSupported: string[];
}

export class CourseCloItemDto {
  @ApiProperty({ example: 'CLO-1' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Mahasiswa mampu menyusun outline esai akademik dengan struktur yang jelas.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  targetAchievementPct?: number;
}

export class GenerateObeDraftDto {
  @ApiPropertyOptional({ example: 'S1 Sastra Inggris' })
  @IsOptional()
  @IsString()
  programStudy?: string;

  @ApiPropertyOptional({ example: '2026/2027' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ example: '19 April 2026' })
  @IsOptional()
  @IsString()
  generatedDate?: string;

  @ApiPropertyOptional({ example: '1.0 (AI Generated)' })
  @IsOptional()
  @IsString()
  draftVersion?: string;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsInt()
  @Min(0)
  evidenceCount?: number;

  @ApiPropertyOptional({ type: [GraduateProfileItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GraduateProfileItemDto)
  graduateProfiles?: GraduateProfileItemDto[];

  @ApiPropertyOptional({ type: [PloItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PloItemDto)
  plos?: PloItemDto[];

  @ApiPropertyOptional({ type: [CourseMappingItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseMappingItemDto)
  courseMappings?: CourseMappingItemDto[];

  @ApiPropertyOptional({ example: 'Academic Writing' })
  @IsOptional()
  @IsString()
  sampleCourseName?: string;

  @ApiPropertyOptional({ type: [CourseCloItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseCloItemDto)
  sampleClos?: CourseCloItemDto[];
}
