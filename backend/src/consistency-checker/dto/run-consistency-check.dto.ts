import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RunConsistencyCheckDto {
  @ApiPropertyOptional({ example: 'a1111111-1111-1111-1111-111111111001' })
  @IsOptional()
  @IsString()
  ledDocumentOutputId?: string;

  @ApiPropertyOptional({ example: 'a1111111-1111-1111-1111-111111111002' })
  @IsOptional()
  @IsString()
  obeDocumentOutputId?: string;

  @ApiPropertyOptional({ example: 'a1111111-1111-1111-1111-111111111003' })
  @IsOptional()
  @IsString()
  rpsDocumentOutputId?: string;

  @ApiPropertyOptional({ example: 'Academic Writing' })
  @IsOptional()
  @IsString()
  focusCourseName?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  historyLimit?: number;
}
