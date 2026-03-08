import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLecturersSummaryDto } from './dto/create-bkd.dto.js';

@Injectable()
export class BkdService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { academicYearId?: string; institutionId?: string; studyProgramId?: string }) {
    const where: Record<string, unknown> = {};
    if (query.academicYearId) where.academicYearId = query.academicYearId;
    if (query.institutionId) where.institutionId = query.institutionId;
    if (query.studyProgramId) where.studyProgramId = query.studyProgramId;

    const data = await this.prisma.lecturersSummary.findMany({
      where,
      orderBy: { academicYearId: 'asc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async findOne(id: string) {
    const data = await this.prisma.lecturersSummary.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Lecturers summary not found');
    return { success: true, data };
  }

  async create(dto: CreateLecturersSummaryDto) {
    const data = await this.prisma.lecturersSummary.create({ data: dto });
    return { success: true, data, message: 'Lecturers summary created' };
  }

  async update(id: string, dto: Partial<CreateLecturersSummaryDto>) {
    const existing = await this.prisma.lecturersSummary.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lecturers summary not found');

    const data = await this.prisma.lecturersSummary.update({ where: { id }, data: dto });
    return { success: true, data, message: 'Lecturers summary updated' };
  }

  async remove(id: string) {
    const existing = await this.prisma.lecturersSummary.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lecturers summary not found');

    await this.prisma.lecturersSummary.delete({ where: { id } });
    return { success: true, data: null, message: 'Lecturers summary deleted' };
  }
}