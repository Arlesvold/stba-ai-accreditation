import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckConsistencyDto {
  @ApiProperty({ description: 'Document output ID yang akan dicek konsistensinya.' })
  @IsString()
  documentOutputId!: string;

  @ApiPropertyOptional({
    description: 'Draft LED terbaru dari editor reviewer. Jika kosong, sistem memakai sectionText dari DB.',
  })
  @IsString()
  @IsOptional()
  draftText?: string;

  @ApiPropertyOptional({
    description: 'Section code spesifik, contoh LED-C1. Jika tidak dikirim, checker memakai seluruh section.',
  })
  @IsString()
  @IsOptional()
  sectionCode?: string;

  @ApiPropertyOptional({
    description: 'Simpan hasil checker ke tabel validation_results. Default true.',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  persist?: boolean;
}
