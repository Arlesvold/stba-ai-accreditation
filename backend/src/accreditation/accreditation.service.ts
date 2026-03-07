import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateScoreDto, UpdateScoreDto } from './dto/accreditation.dto.js';

@Injectable()
export class AccreditationService {
  constructor(private prisma: PrismaService) {}

  async getReadiness(year?: number) {
    const targetYear = year ?? new Date().getFullYear();

    const criteria = await this.prisma.accreditationScore.findMany({
      where: { year: targetYear },
      orderBy: { criteriaNo: 'asc' },
    });

    const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
    const totalMax = criteria.reduce((sum, c) => sum + c.maxScore, 0);
    const overallScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 1000) / 10 : 0;

    return {
      success: true,
      data: {
        overallScore,
        criteria: criteria.map((c) => ({
          id: c.id,
          number: c.criteriaNo,
          name: c.criteriaName,
          score: c.score,
          maxScore: c.maxScore,
          status: c.score / c.maxScore >= 0.7 ? 'good' : 'at_risk',
          gap: c.maxScore - c.score,
        })),
      },
    };
  }

  async createScore(dto: CreateScoreDto) {
    const data = await this.prisma.accreditationScore.create({
      data: {
        criteriaNo: dto.criteriaNo,
        criteriaName: dto.criteriaName,
        score: dto.score,
        maxScore: dto.maxScore ?? 100,
        year: dto.year,
        notes: dto.notes,
      },
    });
    return { success: true, data, message: 'Skor kriteria berhasil ditambahkan' };
  }

  async updateScore(id: string, dto: UpdateScoreDto) {
    const existing = await this.prisma.accreditationScore.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Skor kriteria tidak ditemukan');

    const data = await this.prisma.accreditationScore.update({
      where: { id },
      data: dto,
    });
    return { success: true, data, message: 'Skor kriteria berhasil diupdate' };
  }
}
