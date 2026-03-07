import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateLedDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Nomor kriteria yang akan di-generate' })
  @IsArray()
  @IsInt({ each: true })
  criteria: number[];

  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;

  @ApiPropertyOptional({ example: 'docx', default: 'docx' })
  @IsString()
  @IsOptional()
  format?: string;
}
