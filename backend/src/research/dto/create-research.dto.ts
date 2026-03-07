import { IsString, IsInt, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PublicationTypeDto {
  JOURNAL = 'JOURNAL',
  CONFERENCE = 'CONFERENCE',
  BOOK = 'BOOK',
  CHAPTER = 'CHAPTER',
}

export class CreatePublicationDto {
  @ApiProperty({ example: 'AI in Language Learning' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'This study explores...' })
  @IsString()
  @IsOptional()
  abstract?: string;

  @ApiProperty({ example: 'SINTA 2' })
  @IsString()
  journal: string;

  @ApiPropertyOptional({ example: 'S2' })
  @IsString()
  @IsOptional()
  sintaLevel?: string;

  @ApiPropertyOptional({ example: '10.xxxx/xxxx' })
  @IsString()
  @IsOptional()
  doi?: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  @IsOptional()
  citations?: number;

  @ApiProperty({ enum: PublicationTypeDto, example: 'JOURNAL' })
  @IsEnum(PublicationTypeDto)
  type: PublicationTypeDto;
}

export class CreateGrantDto {
  @ApiProperty({ example: 'Penelitian AI untuk Pendidikan' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Kemenristekdikti' })
  @IsString()
  source: string;

  @ApiProperty({ example: 50000000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateHkiDto {
  @ApiProperty({ example: 'Aplikasi Pembelajaran Bahasa' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Hak Cipta' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'EC00202400001' })
  @IsString()
  @IsOptional()
  regNumber?: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;

  @ApiPropertyOptional({ example: 'REGISTERED' })
  @IsString()
  @IsOptional()
  status?: string;
}
