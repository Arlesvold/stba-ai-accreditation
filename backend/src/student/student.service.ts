import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAlumniDto, CreateAchievementDto } from './dto/student.dto.js';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  // ===== Alumni / Tracer Study =====

  async findAllAlumni(query: { graduationYear?: number; programStudy?: string }) {
    const where: Record<string, unknown> = {};
    if (query.graduationYear) where.graduationYear = query.graduationYear;
    if (query.programStudy) where.programStudy = query.programStudy;

    const data = await this.prisma.alumni.findMany({
      where,
      orderBy: { graduationYear: 'desc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async createAlumni(dto: CreateAlumniDto) {
    const data = await this.prisma.alumni.create({ data: dto });
    return { success: true, data, message: 'Data alumni berhasil ditambahkan' };
  }

  async updateAlumni(id: string, dto: Partial<CreateAlumniDto>) {
    const existing = await this.prisma.alumni.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data alumni tidak ditemukan');

    const data = await this.prisma.alumni.update({ where: { id }, data: dto });
    return { success: true, data, message: 'Data alumni berhasil diupdate' };
  }

  async removeAlumni(id: string) {
    const existing = await this.prisma.alumni.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data alumni tidak ditemukan');

    await this.prisma.alumni.delete({ where: { id } });
    return { success: true, data: null, message: 'Data alumni berhasil dihapus' };
  }

  async getTracerStudySummary(graduationYear?: number) {
    const where: Record<string, unknown> = {};
    if (graduationYear) where.graduationYear = graduationYear;

    const alumni = await this.prisma.alumni.findMany({ where });
    const total = alumni.length;
    const employed = alumni.filter((a) => a.employmentStatus === 'Employed').length;
    const avgWaiting = total > 0
      ? alumni.reduce((sum, a) => sum + (a.waitingMonths ?? 0), 0) / total
      : 0;

    return {
      success: true,
      data: {
        totalAlumni: total,
        employed,
        unemployed: total - employed,
        employmentRate: total > 0 ? Math.round((employed / total) * 100) : 0,
        avgWaitingMonths: Math.round(avgWaiting * 10) / 10,
      },
    };
  }

  // ===== Student Achievements =====

  async findAllAchievements(query: { year?: number; category?: string }) {
    const where: Record<string, unknown> = {};
    if (query.year) where.year = query.year;
    if (query.category) where.category = query.category;

    const data = await this.prisma.studentAchievement.findMany({
      where,
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async createAchievement(dto: CreateAchievementDto) {
    const data = await this.prisma.studentAchievement.create({ data: dto });
    return { success: true, data, message: 'Prestasi mahasiswa berhasil ditambahkan' };
  }

  async removeAchievement(id: string) {
    const existing = await this.prisma.studentAchievement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data prestasi tidak ditemukan');

    await this.prisma.studentAchievement.delete({ where: { id } });
    return { success: true, data: null, message: 'Data prestasi berhasil dihapus' };
  }
}
