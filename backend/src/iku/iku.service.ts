import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateIkuDto } from './dto/create-iku.dto.js';
import { UpdateIkuDto } from './dto/update-iku.dto.js';

@Injectable()
export class IkuService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { academicYearId?: string; ikuCode?: string; institutionId?: string }) {
    const where: Record<string, unknown> = {};
    if (query.academicYearId) where.academicYearId = query.academicYearId;
    if (query.ikuCode) where.ikuCode = query.ikuCode;
    if (query.institutionId) where.institutionId = query.institutionId;

    const data = await this.prisma.iKUValue.findMany({
      where,
      orderBy: { ikuCode: 'asc' },
    });

    return {
      success: true,
      data,
      meta: { total: data.length },
    };
  }

  async create(dto: CreateIkuDto) {
    const data = await this.prisma.iKUValue.create({ data: dto });
    return { success: true, data, message: 'Data IKU berhasil ditambahkan' };
  }

  async update(id: string, dto: UpdateIkuDto) {
    const existing = await this.prisma.iKUValue.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data IKU tidak ditemukan');

    const data = await this.prisma.iKUValue.update({ where: { id }, data: dto });
    return { success: true, data, message: 'Data IKU berhasil diupdate' };
  }

  async remove(id: string) {
    const existing = await this.prisma.iKUValue.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Data IKU tidak ditemukan');

    await this.prisma.iKUValue.delete({ where: { id } });
    return { success: true, data: null, message: 'Data IKU berhasil dihapus' };
  }
}