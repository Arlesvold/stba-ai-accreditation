import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GenerateDocumentDto } from './dto/generate-led.dto.js';

@Injectable()
export class LedService {
  constructor(private prisma: PrismaService) {}

  async generate(dto: GenerateDocumentDto, userId: string) {
    const job = await this.prisma.documentGenerationJob.create({
      data: {
        documentDefinitionId: dto.documentDefinitionId,
        institutionId: dto.institutionId,
        studyProgramId: dto.studyProgramId,
        academicYearId: dto.academicYearId,
        requestedBy: userId,
        jobStatus: 'PENDING',
        notes: dto.notes,
      },
    });

    return {
      success: true,
      data: {
        jobId: job.id,
        status: 'pending',
      },
    };
  }

  async getStatus(jobId: string) {
    const job = await this.prisma.documentGenerationJob.findUnique({
      where: { id: jobId },
      include: { outputs: true },
    });
    if (!job) throw new NotFoundException('Document generation job tidak ditemukan');

    return {
      success: true,
      data: {
        jobId: job.id,
        status: job.jobStatus.toLowerCase(),
        outputs: job.outputs,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
      },
    };
  }

  async getDownload(jobId: string) {
    const job = await this.prisma.documentGenerationJob.findUnique({
      where: { id: jobId },
      include: { outputs: true },
    });
    if (!job) throw new NotFoundException('Document generation job tidak ditemukan');

    const output = job.outputs[0];
    if (!output) throw new NotFoundException('Output belum tersedia');

    return {
      success: true,
      data: {
        jobId: job.id,
        docxFileKey: output.docxFileKey,
        pdfFileKey: output.pdfFileKey,
        title: output.title,
      },
    };
  }

  async findAllJobs(query: { institutionId?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (query.institutionId) where.institutionId = query.institutionId;
    if (query.status) where.jobStatus = query.status;

    const data = await this.prisma.documentGenerationJob.findMany({
      where,
      include: { documentDefinition: true, outputs: true },
      orderBy: { startedAt: 'desc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }
}