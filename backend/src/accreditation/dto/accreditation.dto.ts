import { IsString, IsOptional, IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateVmtsDto {
  @ApiProperty()
  @IsUUID()
  institutionId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  studyProgramId?: string;

  @ApiProperty({ example: 'Menjadi institusi bahasa asing terkemuka' })
  @IsString()
  vision: string;

  @ApiProperty({ example: 'Menyelenggarakan pendidikan bahasa yang bermutu' })
  @IsString()
  mission: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  goals?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  strategies?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  versionNo?: number;
}

export class UpdateVmtsDto extends PartialType(CreateVmtsDto) {}