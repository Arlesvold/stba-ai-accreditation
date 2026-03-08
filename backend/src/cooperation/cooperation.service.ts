import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCooperationDto } from './dto/create-cooperation.dto.js';

@Injectable()
export class CooperationService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { scope?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (query.scope) where.scope = query.scope;
    if (query.status) where.status = query.status;

    const data = await this.prisma.cooperation.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async findOne(id: string) {
    const data = await this.prisma.cooperation.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Cooperation not found');
    return { success: true, data };
  }

  async create(dto: CreateCooperationDto) {
    const data = await this.prisma.cooperation.create({ data: dto });
    return { success: true, data, message: 'Kerjasama berhasil ditambahkan' };
  }

  async update(id: string, dto: Partial<CreateCooperationDto>) {
    const existing = await this.prisma.cooperation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Cooperation not found');

    const data = await this.prisma.cooperation.update({ where: { id }, data: dto });
    return { success: true, data, message: 'Kerjasama berhasil diupdate' };
  }

  async remove(id: string) {
    const existing = await this.prisma.cooperation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Cooperation not found');

    await this.prisma.cooperation.delete({ where: { id } });
    return { success: true, data: null, message: 'Kerjasama berhasil dihapus' };
  }
}
