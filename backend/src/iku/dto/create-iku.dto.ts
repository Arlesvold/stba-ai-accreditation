import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIkuDto {
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
  @IsUUID()
  @IsOptional()
  sourceUnitId?: string;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsString()
  @IsOptional()
  validationStatus?: string;
}