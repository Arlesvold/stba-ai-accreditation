import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSpmiDto } from './dto/create-spmi.dto.js';

@Injectable()
export class SpmiService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { year?: number; phase?: string }) {
    const where: Record<string, unknown> = {};
    if (query.year) where.year = query.year;
    if (query.phase) where.phase = query.phase;

    const data = await this.prisma.sPMICycle.findMany({
      where,
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async findOne(id: string) {
    const data = await this.prisma.sPMICycle.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('SPMI cycle not found');
    return { success: true, data };
  }

  async create(dto: CreateSpmiDto) {
    const data = await this.prisma.sPMICycle.create({ data: dto });
    return { success: true, data, message: 'SPMI cycle created' };
  }

  async update(id: string, dto: Partial<CreateSpmiDto>) {
    const existing = await this.prisma.sPMICycle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('SPMI cycle not found');

    const data = await this.prisma.sPMICycle.update({ where: { id }, data: dto });
    return { success: true, data, message: 'SPMI cycle updated' };
  }

  async remove(id: string) {
    const existing = await this.prisma.sPMICycle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('SPMI cycle not found');

    await this.prisma.sPMICycle.delete({ where: { id } });
    return { success: true, data: null, message: 'SPMI cycle deleted' };
  }
}
