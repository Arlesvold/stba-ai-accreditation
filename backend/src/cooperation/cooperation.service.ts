import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServiceSummaryDto } from './dto/create-cooperation.dto.js';

@Injectable()
export class CooperationService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { institutionId?: string; academicYearId?: string }) {
    const where: Record<string, unknown> = {};
    if (query.institutionId) where.institutionId = query.institutionId;
    if (query.academicYearId) where.academicYearId = query.academicYearId;

    const data = await this.prisma.serviceSummary.findMany({
      where,
      include: { institution: true, academicYear: true, studyProgram: true },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async findOne(id: string) {
    const data = await this.prisma.serviceSummary.findUnique({
      where: { id },
      include: { institution: true, academicYear: true, studyProgram: true },
    });
    if (!data) throw new NotFoundException('Service summary not found');
    return { success: true, data };
  }

  async create(dto: CreateServiceSummaryDto) {
    const data = await this.prisma.serviceSummary.create({ data: dto });
    return { success: true, data, message: 'Service summary created' };
  }

  async update(id: string, dto: Partial<CreateServiceSummaryDto>) {
    const existing = await this.prisma.serviceSummary.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service summary not found');

    const data = await this.prisma.serviceSummary.update({ where: { id }, data: dto });
    return { success: true, data, message: 'Service summary updated' };
  }

  async remove(id: string) {
    const existing = await this.prisma.serviceSummary.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service summary not found');

    await this.prisma.serviceSummary.delete({ where: { id } });
    return { success: true, data: null, message: 'Service summary deleted' };
  }
}