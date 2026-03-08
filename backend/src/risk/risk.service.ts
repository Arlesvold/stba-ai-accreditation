import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateValidationDto } from './dto/create-risk.dto.js';

@Injectable()
export class RiskService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { documentOutputId?: string; severity?: string; validationType?: string }) {
    const where: Record<string, unknown> = {};
    if (query.documentOutputId) where.documentOutputId = query.documentOutputId;
    if (query.severity) where.severity = query.severity;
    if (query.validationType) where.validationType = query.validationType;

    const data = await this.prisma.validationResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async create(dto: CreateValidationDto) {
    const data = await this.prisma.validationResult.create({ data: dto });
    return { success: true, data, message: 'Validation result berhasil ditambahkan' };
  }

  async remove(id: string) {
    const existing = await this.prisma.validationResult.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Validation result tidak ditemukan');

    await this.prisma.validationResult.delete({ where: { id } });
    return { success: true, data: null, message: 'Validation result berhasil dihapus' };
  }
}