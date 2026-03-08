import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStudentsSummaryDto, CreateGraduatesDto } from './dto/student.dto.js';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  // ===== Students Summary =====

  async findAllStudentsSummary(query: { academicYearId?: string; institutionId?: string }) {
    const where: Record<string, unknown> = {};
    if (query.academicYearId) where.academicYearId = query.academicYearId;
    if (query.institutionId) where.institutionId = query.institutionId;

    const data = await this.prisma.studentsSummary.findMany({
      where,
      orderBy: { academicYearId: 'asc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async createStudentsSummary(dto: CreateStudentsSummaryDto) {
    const data = await this.prisma.studentsSummary.create({ data: dto });
    return { success: true, data, message: 'Data mahasiswa berhasil ditambahkan' };
  }

  async updateStudentsSummary(id: string, dto: Partial<CreateStudentsSummaryDto>) {
    const existing = await this.prisma.studentsSummary.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data mahasiswa tidak ditemukan');

    const data = await this.prisma.studentsSummary.update({ where: { id }, data: dto });
    return { success: true, data, message: 'Data mahasiswa berhasil diupdate' };
  }

  async removeStudentsSummary(id: string) {
    const existing = await this.prisma.studentsSummary.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data mahasiswa tidak ditemukan');

    await this.prisma.studentsSummary.delete({ where: { id } });
    return { success: true, data: null, message: 'Data mahasiswa berhasil dihapus' };
  }

  // ===== Graduates Outcomes =====

  async findAllGraduates(query: { academicYearId?: string; institutionId?: string }) {
    const where: Record<string, unknown> = {};
    if (query.academicYearId) where.academicYearId = query.academicYearId;
    if (query.institutionId) where.institutionId = query.institutionId;

    const data = await this.prisma.graduatesOutcomes.findMany({
      where,
      orderBy: { academicYearId: 'asc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async createGraduates(dto: CreateGraduatesDto) {
    const data = await this.prisma.graduatesOutcomes.create({ data: dto });
    return { success: true, data, message: 'Data lulusan berhasil ditambahkan' };
  }

  async updateGraduates(id: string, dto: Partial<CreateGraduatesDto>) {
    const existing = await this.prisma.graduatesOutcomes.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data lulusan tidak ditemukan');

    const data = await this.prisma.graduatesOutcomes.update({ where: { id }, data: dto });
    return { success: true, data, message: 'Data lulusan berhasil diupdate' };
  }
}