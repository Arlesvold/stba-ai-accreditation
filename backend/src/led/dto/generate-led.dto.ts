import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateDocumentDto {
  @ApiProperty({ description: 'ID of the document definition (e.g., LED, LKPS)' })
  @IsString()
  documentDefinitionId!: string;

  @ApiProperty()
  @IsString()
  institutionId!: string;

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

  @ApiPropertyOptional({
    description: 'Daftar kriteria LED yang ingin digenerate',
    example: [1, 2, 4, 9],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(9)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(9, { each: true })
  @IsOptional()
  criteria?: number[];

  @ApiPropertyOptional({
    description: 'Format output dokumen LED',
    enum: ['docx', 'pdf'],
    default: 'docx',
  })
  @IsString()
  @IsIn(['docx', 'pdf'])
  @IsOptional()
  format?: 'docx' | 'pdf';

  @ApiPropertyOptional({
    description: 'Tahun akademik awal untuk konteks generasi narasi',
    example: 2024,
  })
  @IsInt()
  @Min(2000)
  @Max(2100)
  @IsOptional()
  year?: number;
}