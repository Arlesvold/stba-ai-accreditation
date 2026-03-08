import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateDocumentDto {
  @ApiProperty({ description: 'ID of the document definition (e.g., LED, LKPS)' })
  @IsUUID()
  documentDefinitionId: string;

  @ApiProperty()
  @IsUUID()
  institutionId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  studyProgramId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  academicYearId?: string;

  @ApiPropertyOptional({ example: 'Generate LED Kriteria 1-9' })
  @IsString()
  @IsOptional()
  notes?: string;
}