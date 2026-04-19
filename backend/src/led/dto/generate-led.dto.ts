import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateDocumentDto {
  @ApiProperty({ description: 'ID of the document definition (e.g., LED, LKPS)' })
  @IsString()
  documentDefinitionId: string;

  @ApiProperty()
  @IsString()
  institutionId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  studyProgramId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  academicYearId?: string;

  @ApiPropertyOptional({ example: 'Generate LED Kriteria 1-9' })
  @IsString()
  @IsOptional()
  notes?: string;
}