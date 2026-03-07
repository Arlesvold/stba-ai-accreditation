import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GenerateLedDto } from './dto/generate-led.dto.js';

@Injectable()
export class LedService {
  constructor(private prisma: PrismaService) {}

  async generate(dto: GenerateLedDto, userId: string) {
    // Create LED document record with PROCESSING status
    // Actual AI generation will be implemented by the AI team later
    const doc = await this.prisma.lEDDocument.create({
      data: {
        title: `LED ${dto.year} - Kriteria ${dto.criteria.join(', ')}`,
        year: dto.year,
        status: 'PROCESSING',
        generatedBy: userId,
      },
    });

    return {
      success: true,
      data: {
        jobId: doc.id,
        status: 'processing',
        estimatedTime: '2 minutes',
      },
    };
  }

  async getStatus(jobId: string) {
    const doc = await this.prisma.lEDDocument.findUnique({ where: { id: jobId } });
    if (!doc) throw new NotFoundException('LED document tidak ditemukan');

    return {
      success: true,
      data: {
        jobId: doc.id,
        status: doc.status.toLowerCase(),
        fileUrl: doc.fileUrl,
      },
    };
  }

  async getDownload(jobId: string) {
    const doc = await this.prisma.lEDDocument.findUnique({ where: { id: jobId } });
    if (!doc) throw new NotFoundException('LED document tidak ditemukan');
    if (!doc.fileUrl) throw new NotFoundException('File belum tersedia');

    return {
      success: true,
      data: {
        jobId: doc.id,
        fileUrl: doc.fileUrl,
        title: doc.title,
      },
    };
  }
}
