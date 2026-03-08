import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateVmtsDto, UpdateVmtsDto } from './dto/accreditation.dto.js';

@Injectable()
export class AccreditationService {
  constructor(private prisma: PrismaService) {}

  async getVmts(query: { institutionId?: string; studyProgramId?: string }) {
    const where: Record<string, unknown> = {};
    if (query.institutionId) where.institutionId = query.institutionId;
    if (query.studyProgramId) where.studyProgramId = query.studyProgramId;

    const data = await this.prisma.vMTS.findMany({ where });
    return { success: true, data, meta: { total: data.length } };
  }

  async createVmts(dto: CreateVmtsDto) {
    const data = await this.prisma.vMTS.create({ data: dto });
    return { success: true, data, message: 'VMTS berhasil ditambahkan' };
  }

  async updateVmts(id: string, dto: UpdateVmtsDto) {
    const existing = await this.prisma.vMTS.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('VMTS tidak ditemukan');

    const data = await this.prisma.vMTS.update({ where: { id }, data: dto });
    return { success: true, data, message: 'VMTS berhasil diupdate' };
  }

  async getReadiness(institutionId: string) {
    const [vmts, docDefs, evidenceDocs] = await Promise.all([
      this.prisma.vMTS.count({ where: { institutionId } }),
      this.prisma.documentDefinition.count(),
      this.prisma.evidenceDocument.count({ where: { institutionId } }),
    ]);

    return {
      success: true,
      data: {
        vmtsReady: vmts > 0,
        documentDefinitions: docDefs,
        evidenceUploaded: evidenceDocs,
      },
    };
  }
}