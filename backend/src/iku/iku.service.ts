import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateIkuDto } from './dto/create-iku.dto.js';
import { UpdateIkuDto } from './dto/update-iku.dto.js';

@Injectable()
export class IkuService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { year?: number; criteria?: number; semester?: number }) {
    const where: Record<string, unknown> = {};
    if (query.year) where.year = query.year;
    if (query.criteria) where.criteriaNo = query.criteria;
    if (query.semester) where.semester = query.semester;

    const data = await this.prisma.iKUData.findMany({
      where,
      orderBy: { criteriaNo: 'asc' },
    });

    return {
      success: true,
      data: data.map((item) => ({
        ...item,
        percentage: item.target > 0 ? Math.round((item.current / item.target) * 100) : 0,
        status: item.target > 0 && item.current / item.target >= 0.7 ? 'on_track' : 'at_risk',
      })),
      meta: { total: data.length },
    };
  }

  async create(dto: CreateIkuDto, userId: string) {
    const data = await this.prisma.iKUData.create({
      data: { ...dto, updatedBy: userId },
    });
    return { success: true, data, message: 'Data IKU berhasil ditambahkan' };
  }

  async update(id: string, dto: UpdateIkuDto) {
    const existing = await this.prisma.iKUData.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data IKU tidak ditemukan');

    const data = await this.prisma.iKUData.update({
      where: { id },
      data: dto,
    });
    return { success: true, data, message: 'Data IKU berhasil diupdate' };
  }

  async remove(id: string) {
    const existing = await this.prisma.iKUData.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data IKU tidak ditemukan');

    await this.prisma.iKUData.delete({ where: { id } });
    return { success: true, data: null, message: 'Data IKU berhasil dihapus' };
  }
}
