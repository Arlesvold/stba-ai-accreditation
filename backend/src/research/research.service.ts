import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateResearchSummaryDto } from './dto/create-research.dto.js';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { academicYearId?: string; studyProgramId?: string; institutionId?: string }) {
    const where: Record<string, unknown> = {};
    if (query.academicYearId) where.academicYearId = query.academicYearId;
    if (query.studyProgramId) where.studyProgramId = query.studyProgramId;
    if (query.institutionId) where.institutionId = query.institutionId;

    const data = await this.prisma.researchSummary.findMany({
      where,
      orderBy: { academicYearId: 'asc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async create(dto: CreateResearchSummaryDto) {
    const data = await this.prisma.researchSummary.create({ data: dto });
    return { success: true, data, message: 'Data riset berhasil ditambahkan' };
  }

  async update(id: string, dto: Partial<CreateResearchSummaryDto>) {
    const existing = await this.prisma.researchSummary.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data riset tidak ditemukan');

    const data = await this.prisma.researchSummary.update({ where: { id }, data: dto });
    return { success: true, data, message: 'Data riset berhasil diupdate' };
  }

  async remove(id: string) {
    const existing = await this.prisma.researchSummary.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data riset tidak ditemukan');

    await this.prisma.researchSummary.delete({ where: { id } });
    return { success: true, data: null, message: 'Data riset berhasil dihapus' };
  }
}