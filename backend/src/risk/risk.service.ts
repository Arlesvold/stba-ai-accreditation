import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRiskAlertDto } from './dto/create-risk.dto.js';

@Injectable()
export class RiskService {
  constructor(private prisma: PrismaService) {}

  async findAllAlerts(query: {
    level?: string;
    isResolved?: boolean;
    criteriaNo?: number;
  }) {
    const where: Record<string, unknown> = {};
    if (query.level) where.level = query.level;
    if (query.isResolved !== undefined) where.isResolved = query.isResolved;
    if (query.criteriaNo) where.criteriaNo = query.criteriaNo;

    const data = await this.prisma.riskAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async createAlert(dto: CreateRiskAlertDto) {
    const data = await this.prisma.riskAlert.create({ data: dto });
    return { success: true, data, message: 'Risk alert berhasil ditambahkan' };
  }

  async resolveAlert(id: string) {
    const existing = await this.prisma.riskAlert.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Risk alert tidak ditemukan');

    const data = await this.prisma.riskAlert.update({
      where: { id },
      data: { isResolved: true, resolvedAt: new Date() },
    });
    return { success: true, data, message: 'Risk alert berhasil di-resolve' };
  }
}
