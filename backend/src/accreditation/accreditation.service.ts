import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateScoreDto,
  CreateVmtsDto,
  UpdateVmtsDto,
  UpdateScoreDto,
} from './dto/accreditation.dto.js';

const DEFAULT_BAN_PT_CRITERIA = [
  {
    criteriaNo: 1,
    criteriaName: 'Visi, Misi, Tujuan dan Strategi',
    seedScore: 88,
    seedNotes: 'Baseline demo: dokumen strategis sudah relatif kuat.',
  },
  {
    criteriaNo: 2,
    criteriaName: 'Tata Pamong, Tata Kelola, dan Kerjasama',
    seedScore: 81,
    seedNotes: 'Baseline demo: tata kelola baik, perlu penguatan monitoring kerja sama.',
  },
  {
    criteriaNo: 3,
    criteriaName: 'Mahasiswa',
    seedScore: 77,
    seedNotes: 'Baseline demo: layanan mahasiswa baik, tracer study perlu ditingkatkan.',
  },
  {
    criteriaNo: 4,
    criteriaName: 'Sumber Daya Manusia',
    seedScore: 84,
    seedNotes: 'Baseline demo: kompetensi dosen memadai dengan ruang peningkatan sertifikasi.',
  },
  {
    criteriaNo: 5,
    criteriaName: 'Keuangan, Sarana, dan Prasarana',
    seedScore: 73,
    seedNotes: 'Baseline demo: sarana utama tersedia, modernisasi fasilitas perlu akselerasi.',
  },
  {
    criteriaNo: 6,
    criteriaName: 'Pendidikan',
    seedScore: 86,
    seedNotes: 'Baseline demo: implementasi pembelajaran sudah konsisten dan terstruktur.',
  },
  {
    criteriaNo: 7,
    criteriaName: 'Penelitian',
    seedScore: 79,
    seedNotes: 'Baseline demo: produktivitas penelitian tumbuh namun dampak publikasi perlu didorong.',
  },
  {
    criteriaNo: 8,
    criteriaName: 'Pengabdian kepada Masyarakat',
    seedScore: 75,
    seedNotes: 'Baseline demo: program pengabdian rutin berjalan, evaluasi luaran perlu diperdalam.',
  },
  {
    criteriaNo: 9,
    criteriaName: 'Luaran dan Capaian Tridharma',
    seedScore: 82,
    seedNotes: 'Baseline demo: capaian utama positif dengan peluang peningkatan indikator internasional.',
  },
] as const;

type AccreditationScoreRow = {
  id: string;
  criteriaNo: number;
  criteriaName: string;
  score: number;
  maxScore: number;
  year: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type RawAccreditationScoreRow = {
  id: string;
  criteria_no: number;
  criteria_name: string;
  score: number;
  max_score: number;
  year: number;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class AccreditationService {
  constructor(private prisma: PrismaService) {}

  private async ensureDefaultScores(year: number) {
    const existingRows = await this.prisma.$queryRaw<
      { criteria_no: number; score: number; notes: string | null }[]
    >`
      SELECT criteria_no, score, notes
      FROM accreditation_scores
      WHERE year = ${year}
    `;

    if (existingRows.length === 0) {
      for (const criterion of DEFAULT_BAN_PT_CRITERIA) {
        await this.prisma.$executeRaw`
          INSERT INTO accreditation_scores (
            id,
            criteria_no,
            criteria_name,
            score,
            max_score,
            year,
            notes,
            created_at,
            updated_at
          )
          VALUES (
            ${randomUUID()},
            ${criterion.criteriaNo},
            ${criterion.criteriaName},
            ${criterion.seedScore},
            ${100},
            ${year},
            ${criterion.seedNotes},
            NOW(),
            NOW()
          )
          ON CONFLICT (year, criteria_no) DO NOTHING
        `;
      }
      return;
    }

    const defaultRows = DEFAULT_BAN_PT_CRITERIA
      .map((criterion) =>
        existingRows.find((row) => row.criteria_no === criterion.criteriaNo))
      .filter((row): row is { criteria_no: number; score: number; notes: string | null } =>
        Boolean(row));

    const isLegacyZeroSeed =
      defaultRows.length === DEFAULT_BAN_PT_CRITERIA.length
      && defaultRows.every(
        (row) => row.score === 0
          && (row.notes === null || row.notes === 'Auto-seeded default BAN-PT criterion'),
      );

    if (!isLegacyZeroSeed) {
      return;
    }

    for (const criterion of DEFAULT_BAN_PT_CRITERIA) {
      await this.prisma.$executeRaw`
        UPDATE accreditation_scores
        SET
          criteria_name = ${criterion.criteriaName},
          score = ${criterion.seedScore},
          max_score = ${100},
          notes = ${criterion.seedNotes},
          updated_at = NOW()
        WHERE year = ${year}
        AND criteria_no = ${criterion.criteriaNo}
      `;
    }
  }

  private normalizeScoreRow(row: RawAccreditationScoreRow): AccreditationScoreRow {
    return {
      id: row.id,
      criteriaNo: row.criteria_no,
      criteriaName: row.criteria_name,
      score: row.score,
      maxScore: row.max_score,
      year: row.year,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

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

  async getLegacyReadiness(institutionId: string) {
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

  async getReadiness(year?: number) {
    const targetYear = year ?? new Date().getFullYear();
    await this.ensureDefaultScores(targetYear);

    const rows = await this.prisma.$queryRaw<RawAccreditationScoreRow[]>`
      SELECT
        id,
        criteria_no,
        criteria_name,
        score,
        max_score,
        year,
        notes,
        created_at,
        updated_at
      FROM accreditation_scores
      WHERE year = ${targetYear}
      ORDER BY criteria_no ASC
    `;

    const scores = rows.map((row) => this.normalizeScoreRow(row));
    const totalPercentage = scores.reduce((sum, item) => {
      if (item.maxScore <= 0) {
        return sum;
      }
      const pct = (item.score / item.maxScore) * 100;
      return sum + Math.max(0, Math.min(100, pct));
    }, 0);

    const overallScore =
      scores.length > 0
        ? Number((totalPercentage / scores.length).toFixed(2))
        : 0;

    return {
      success: true,
      data: {
        year: targetYear,
        overallScore,
        maxScore: 100,
        percentage: overallScore,
        criteria: scores.map((item) => {
          const safeGap = Math.max(item.maxScore - item.score, 0);
          const atRiskThreshold = item.maxScore * 0.2;

          return {
            id: item.id,
            number: item.criteriaNo,
            name: item.criteriaName,
            score: item.score,
            maxScore: item.maxScore,
            gap: Number(safeGap.toFixed(2)),
            status: safeGap > atRiskThreshold ? 'at_risk' : 'good',
            notes: item.notes,
            year: item.year,
          };
        }),
      },
    };
  }

  async createScore(dto: CreateScoreDto) {
    const year = dto.year ?? new Date().getFullYear();

    const existing = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM accreditation_scores
      WHERE year = ${year}
      AND criteria_no = ${dto.criteriaNo}
      LIMIT 1
    `;

    if (existing.length > 0) {
      throw new ConflictException(
        `Skor untuk kriteria ${dto.criteriaNo} tahun ${year} sudah ada`,
      );
    }

    const rows = await this.prisma.$queryRaw<RawAccreditationScoreRow[]>`
      INSERT INTO accreditation_scores (
        id,
        criteria_no,
        criteria_name,
        score,
        max_score,
        year,
        notes,
        created_at,
        updated_at
      )
      VALUES (
        ${randomUUID()},
        ${dto.criteriaNo},
        ${dto.criteriaName},
        ${dto.score},
        ${dto.maxScore ?? 100},
        ${year},
        ${dto.notes ?? null},
        NOW(),
        NOW()
      )
      RETURNING
        id,
        criteria_no,
        criteria_name,
        score,
        max_score,
        year,
        notes,
        created_at,
        updated_at
    `;

    return {
      success: true,
      data: this.normalizeScoreRow(rows[0]),
      message: 'Skor akreditasi berhasil ditambahkan',
    };
  }

  async updateScore(id: string, dto: UpdateScoreDto) {
    const existing = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM accreditation_scores
      WHERE id = ${id}
      LIMIT 1
    `;

    if (existing.length === 0) {
      throw new NotFoundException('Skor akreditasi tidak ditemukan');
    }

    const rows = await this.prisma.$queryRaw<RawAccreditationScoreRow[]>`
      UPDATE accreditation_scores
      SET
        score = ${dto.score},
        max_score = COALESCE(${dto.maxScore ?? null}, max_score),
        notes = ${dto.notes ?? null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING
        id,
        criteria_no,
        criteria_name,
        score,
        max_score,
        year,
        notes,
        created_at,
        updated_at
    `;

    const updated = this.normalizeScoreRow(rows[0]);

    return {
      success: true,
      data: updated,
      message: 'Skor akreditasi berhasil diperbarui',
    };
  }
}