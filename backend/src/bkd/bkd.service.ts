import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBkdDto } from './dto/create-bkd.dto.js';

@Injectable()
export class BkdService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { userId?: string; year?: number }) {
    const where: Record<string, unknown> = {};
    if (query.userId) where.userId = query.userId;
    if (query.year) where.year = query.year;

    const data = await this.prisma.bKDReport.findMany({
      where,
      include: { user: { select: { id: true, name: true, nidn: true } } },
      orderBy: [{ year: 'desc' }, { semester: 'asc' }],
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async findOne(id: string) {
    const data = await this.prisma.bKDReport.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, nidn: true } } },
    });
    if (!data) throw new NotFoundException('BKD report not found');
    return { success: true, data };
  }

  async create(dto: CreateBkdDto, userId: string) {
    const data = await this.prisma.bKDReport.create({
      data: { ...dto, userId },
    });
    return { success: true, data, message: 'BKD report created' };
  }

  async update(id: string, dto: Partial<CreateBkdDto>) {
    const existing = await this.prisma.bKDReport.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('BKD report not found');

    const data = await this.prisma.bKDReport.update({ where: { id }, data: dto });
    return { success: true, data, message: 'BKD report updated' };
  }

  async remove(id: string) {
    const existing = await this.prisma.bKDReport.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('BKD report not found');

    await this.prisma.bKDReport.delete({ where: { id } });
    return { success: true, data: null, message: 'BKD report deleted' };
  }
}
