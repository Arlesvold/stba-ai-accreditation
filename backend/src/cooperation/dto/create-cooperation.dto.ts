import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCooperationDto {
  @ApiProperty({ example: 'Universitas Tanjungpura' })
  @IsString()
  partnerName: string;

  @ApiProperty({ example: 'University' })
  @IsString()
  partnerType: string;

  @ApiProperty({ example: 'NATIONAL', enum: ['NATIONAL', 'INTERNATIONAL'] })
  @IsEnum({ NATIONAL: 'NATIONAL', INTERNATIONAL: 'INTERNATIONAL' })
  scope: 'NATIONAL' | 'INTERNATIONAL';

  @ApiProperty({ example: 'MoU Pertukaran Mahasiswa' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Kerjasama pertukaran mahasiswa program Sastra Inggris' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2027-01-01' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'https://docs.example.com/mou.pdf' })
  @IsString()
  @IsOptional()
  documentUrl?: string;

  @ApiPropertyOptional({ example: 'Dr. Smith' })
  @IsString()
  @IsOptional()
  contactPerson?: string;
}
