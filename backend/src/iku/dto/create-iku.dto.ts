import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIkuDto {
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

  @ApiProperty({ example: 'IKU-1' })
  @IsString()
  ikuCode: string;

  @ApiProperty({ example: 85.5 })
  @IsNumber()
  valueNumeric: number;

  @ApiPropertyOptional({ example: '%' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sourceUnitId?: string;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsString()
  @IsOptional()
  validationStatus?: string;
}