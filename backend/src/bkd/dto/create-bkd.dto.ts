import { IsString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBkdDto {
  @ApiProperty({ example: 'Ganjil' })
  @IsString()
  semester: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  teachingHours?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  researchHours?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  serviceHours?: number;

  @ApiPropertyOptional({ example: 22 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  totalCredits?: number;

  @ApiPropertyOptional({ example: 'DRAFT' })
  @IsString()
  @IsOptional()
  status?: string;
}
