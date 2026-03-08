import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Prisma } from '../../../generated/prisma/client.js';

export class CreateChangeLogDto {
  @ApiProperty({ example: 'VMTS' })
  @IsString()
  entityName: string;

  @ApiProperty({ example: 'uuid-of-record' })
  @IsString()
  recordId: string;

  @ApiProperty({ example: 'UPDATE', enum: ['CREATE', 'UPDATE', 'DELETE'] })
  @IsString()
  changeType: string;

  @ApiProperty({ example: 'admin-user-id' })
  @IsString()
  changedBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  beforeData?: Prisma.InputJsonValue;

  @ApiPropertyOptional()
  @IsOptional()
  afterData?: Prisma.InputJsonValue;
}