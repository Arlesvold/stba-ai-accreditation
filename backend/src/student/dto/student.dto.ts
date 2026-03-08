import { IsString, IsInt, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAlumniDto {
  @ApiProperty({ example: '2020001' })
  @IsString()
  nim: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  graduationYear: number;

  @ApiProperty({ example: 'Sastra Inggris' })
  @IsString()
  programStudy: string;

  @ApiPropertyOptional({ example: 'Employed' })
  @IsString()
  @IsOptional()
  employmentStatus?: string;

  @ApiPropertyOptional({ example: 'PT ABC' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ example: 'Translator' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @IsOptional()
  @Min(0)
  waitingMonths?: number;

  @ApiPropertyOptional({ example: 5000000 })
  @IsNumber()
  @IsOptional()
  salary?: number;

  @ApiPropertyOptional({ example: 2025 })
  @IsInt()
  @IsOptional()
  surveyYear?: number;
}

export class CreateAchievementDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  studentName: string;

  @ApiPropertyOptional({ example: '2020001' })
  @IsString()
  @IsOptional()
  nim?: string;

  @ApiProperty({ example: 'Juara 1 Debat Bahasa Inggris' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'NATIONAL', enum: ['REGIONAL', 'NATIONAL', 'INTERNATIONAL'] })
  @IsEnum({ REGIONAL: 'REGIONAL', NATIONAL: 'NATIONAL', INTERNATIONAL: 'INTERNATIONAL' })
  category: 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL';

  @ApiProperty({ example: 'Academic' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'Kemendikbud' })
  @IsString()
  @IsOptional()
  organizer?: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;

  @ApiPropertyOptional({ example: 'Juara 1' })
  @IsString()
  @IsOptional()
  rank?: string;
}
