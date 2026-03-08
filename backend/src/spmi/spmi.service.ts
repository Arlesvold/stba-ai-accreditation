import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateChangeLogDto } from './dto/create-spmi.dto.js';

@Injectable()
export class SpmiService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { entityName?: string; changeType?: string }) {
    const where: Record<string, unknown> = {};
    if (query.entityName) where.entityName = query.entityName;
    if (query.changeType) where.changeType = query.changeType;

    const data = await this.prisma.changeLog.findMany({
      where,
      orderBy: { changedAt: 'desc' },
      take: 100,
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async findOne(id: string) {
    const data = await this.prisma.changeLog.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Change log not found');
    return { success: true, data };
  }

  async create(dto: CreateChangeLogDto) {
    const data = await this.prisma.changeLog.create({ data: dto });
    return { success: true, data, message: 'Change log created' };
  }

  async remove(id: string) {
    const existing = await this.prisma.changeLog.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Change log not found');

    await this.prisma.changeLog.delete({ where: { id } });
    return { success: true, data: null, message: 'Change log deleted' };
  }
}