import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePublicationDto, CreateGrantDto, CreateHkiDto } from './dto/create-research.dto.js';
import type { GrantStatus } from '../../generated/prisma/client.js';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  // ==================== PUBLICATIONS ====================

  async findAllPublications(query: {
    lecturerId?: string;
    year?: number;
    type?: string;
    sintaLevel?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (query.lecturerId) where.authorId = query.lecturerId;
    if (query.year) where.year = query.year;
    if (query.type) where.type = query.type;
    if (query.sintaLevel) where.sintaLevel = query.sintaLevel;

    const data = await this.prisma.publication.findMany({
      where,
      include: { author: { select: { id: true, name: true, nidn: true } } },
      orderBy: { year: 'desc' },
    });

    return {
      success: true,
      data: data.map((p) => ({
        id: p.id,
        title: p.title,
        lecturer: p.author.name,
        journal: p.journal,
        year: p.year,
        doi: p.doi,
        citations: p.citations,
        type: p.type,
        sintaLevel: p.sintaLevel,
      })),
      meta: { total: data.length },
    };
  }

  async createPublication(dto: CreatePublicationDto, userId: string) {
    const data = await this.prisma.publication.create({
      data: {
        title: dto.title,
        abstract: dto.abstract,
        journal: dto.journal,
        sintaLevel: dto.sintaLevel,
        doi: dto.doi,
        year: dto.year,
        citations: dto.citations ?? 0,
        type: dto.type,
        authorId: userId,
      },
    });
    return { success: true, data, message: 'Publikasi berhasil ditambahkan' };
  }

  // ==================== GRANTS ====================

  async findAllGrants(query: { userId?: string; year?: number }) {
    const where: Record<string, unknown> = {};
    if (query.userId) where.userId = query.userId;
    if (query.year) where.year = query.year;

    const data = await this.prisma.researchGrant.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { year: 'desc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async createGrant(dto: CreateGrantDto, userId: string) {
    const data = await this.prisma.researchGrant.create({
      data: {
        title: dto.title,
        source: dto.source,
        amount: dto.amount,
        year: dto.year,
        status: dto.status as GrantStatus,
        userId,
      },
    });
    return { success: true, data, message: 'Hibah penelitian berhasil ditambahkan' };
  }

  // ==================== HKI ====================

  async findAllHki(query: { userId?: string; year?: number }) {
    const where: Record<string, unknown> = {};
    if (query.userId) where.userId = query.userId;
    if (query.year) where.year = query.year;

    const data = await this.prisma.hKI.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { year: 'desc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  async createHki(dto: CreateHkiDto, userId: string) {
    const data = await this.prisma.hKI.create({
      data: { ...dto, userId },
    });
    return { success: true, data, message: 'HKI berhasil ditambahkan' };
  }
}
