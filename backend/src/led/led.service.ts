import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GenerateDocumentDto } from './dto/generate-led.dto.js';
import { CheckConsistencyDto } from './dto/check-consistency.dto.js';

type LedCriterionNo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type CriterionFacts = Record<string, string | number>;

interface RagSource {
  source: string;
  relevanceScore: number;
  reason: string;
  payload: unknown;
}

interface EvidenceBinding {
  evidenceId: string;
  evidenceCode: string;
  title: string;
  documentType: string | null;
  fileKey: string | null;
  fileName: string | null;
  criterionCode: string | null;
  mappingNote: string | null;
}

interface ConsistencyReport {
  passed: boolean;
  repaired: boolean;
  missingFacts: string[];
  crossDocumentConflicts: string[];
}

interface ConsistencyClaimFinding {
  status: 'LOLOS' | 'FLAG_MERAH';
  metricKey: string;
  sentence: string;
  expectedValue: string;
  foundValue: string;
  reason: string;
}

interface ComplianceFinding {
  status: 'LOLOS' | 'WARNING' | 'RED_FLAG';
  ruleCode: string;
  message: string;
  missingEvidence?: string[];
}

interface CriterionArtifact {
  criterionNo: LedCriterionNo;
  criterionCode: string;
  sectionCode: string;
  sectionName: string;
  ragSources: RagSource[];
  structuredData: Record<string, unknown>;
  facts: CriterionFacts;
  prompt: string;
  narrative: string;
  evidenceBindings: EvidenceBinding[];
  consistency: ConsistencyReport;
}

interface LedContext {
  institution: {
    id: string;
    code: string;
    name: string;
    alias: string | null;
    city: string | null;
    province: string | null;
    status: string | null;
    institutionType: string | null;
    focusArea: string | null;
  };
  studyProgram: {
    id: string;
    code: string;
    name: string;
    degreeLevel: string | null;
    accreditationStatus: string | null;
  } | null;
  academicYear: {
    id: string;
    yearLabel: string;
  } | null;
  ragSnapshot: {
    vmts: {
      id: string;
      vision: string;
      mission: string;
      goals: string | null;
      strategies: string | null;
      versionNo: number;
    } | null;
    students: {
      applicantsTotal: number;
      newStudentsTotal: number;
      activeStudentsTotal: number;
      dropoutRatePct: number | null;
      studentAchievementsTotal: number;
      mbkmStudentsTotal: number;
    } | null;
    graduates: {
      avgGpa: number | null;
      avgStudyPeriodYears: number | null;
      employmentWaitMonths: number | null;
      fieldAlignmentPct: number | null;
      continuingStudyPct: number | null;
    } | null;
    lecturers: {
      permanentCount: number;
      nonPermanentCount: number;
      mastersCount: number;
      doctoralCount: number;
      professorCount: number;
      associateProfessorCount: number;
      lecturerCertifiedCount: number;
    } | null;
    education: {
      obeImplementedPct: number | null;
      rpsCompletePct: number | null;
      mbkmCoursesPct: number | null;
      evaluationNotes: unknown;
    } | null;
    research: {
      grantsTotal: number;
      publicationsTotal: number;
      scopusTotal: number;
      iprTotal: number;
      citationTotal: number;
    } | null;
    service: {
      programsTotal: number;
      partnersTotal: number;
      outputsTotal: number;
    } | null;
    finance: {
      operationalBudget: number | null;
      researchBudget: number | null;
      serviceBudget: number | null;
      scholarshipBudget: number | null;
    } | null;
    facilities: {
      classroomsTotal: number;
      labsTotal: number;
      libraryCollectionsTotal: number;
      lmsAvailable: boolean;
      internetCoveragePct: number | null;
    } | null;
    ikuValues: Array<{
      ikuCode: string;
      valueNumeric: number;
      unit: string | null;
      validationStatus: string;
    }>;
    organizationUnitsTotal: number;
    activeStudyProgramsTotal: number;
  };
}

const LED_MCP_TOOL_CODE = 'led.generate';
const LED_CONSISTENCY_TOOL_CODE = 'document.check_consistency';

const CONSISTENCY_SYSTEM_PROMPT =
  'Ekstrak seluruh angka dan klaim faktual dari draf LED ini. Bandingkan dengan data sumber JSON berikut. Jika angka sama beri status LOLOS. Jika berbeda, keluarkan objek JSON berisi status FLAG MERAH, kalimat yang salah, dan angka seharusnya.';

const FACT_KEYWORD_ALIASES: Record<string, string[]> = {
  active_study_programs_total: ['program studi aktif'],
  organization_units_total: ['unit organisasi', 'struktur organisasi'],
  vmts_version: ['versi vmts', 'versi visi misi'],
  applicants_total: ['pendaftar'],
  new_students_total: ['mahasiswa baru'],
  active_students_total: ['mahasiswa aktif'],
  dropout_rate_pct: ['putus studi', 'dropout'],
  student_achievements_total: ['prestasi mahasiswa'],
  mbkm_students_total: ['mahasiswa mbkm'],
  permanent_lecturers_total: ['dosen tetap'],
  non_permanent_lecturers_total: ['dosen tidak tetap', 'dosen tidak permanen'],
  masters_lecturers_total: ['dosen magister', 'dosen s2'],
  doctoral_lecturers_total: ['dosen doktor', 'dosen s3'],
  lecturer_certified_total: ['dosen bersertifikat', 'sertifikasi dosen'],
  lecturer_student_ratio: ['rasio dosen', 'rasio dosen mahasiswa'],
  operational_budget: ['anggaran operasional'],
  research_budget: ['anggaran penelitian'],
  service_budget: ['anggaran pengabdian'],
  scholarship_budget: ['anggaran beasiswa'],
  classrooms_total: ['ruang kelas'],
  labs_total: ['laboratorium'],
  library_collections_total: ['koleksi perpustakaan'],
  internet_coverage_pct: ['cakupan internet'],
  obe_implemented_pct: ['implementasi obe'],
  rps_complete_pct: ['kelengkapan rps'],
  mbkm_courses_pct: ['mata kuliah mbkm'],
  research_grants_total: ['hibah penelitian'],
  publications_total: ['publikasi'],
  scopus_total: ['scopus'],
  ipr_total: ['hki', 'hak kekayaan intelektual'],
  citation_total: ['sitasi'],
  service_programs_total: ['program pengabdian'],
  service_partners_total: ['mitra pengabdian'],
  service_outputs_total: ['luaran pengabdian'],
  avg_gpa: ['rata-rata ipk', 'ipk rata-rata'],
  avg_study_period_years: ['masa studi'],
  employment_wait_months: ['masa tunggu kerja'],
  field_alignment_pct: ['kesesuaian bidang kerja'],
  continuing_study_pct: ['studi lanjut'],
  iku_metrics_total: ['metrik iku', 'indikator iku'],
};

const DEFAULT_CRITERIA: LedCriterionNo[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const CRITERIA_LABELS: Record<LedCriterionNo, string> = {
  1: 'Visi, Misi, Tujuan, dan Strategi',
  2: 'Tata Pamong, Tata Kelola, dan Kerjasama',
  3: 'Mahasiswa',
  4: 'Sumber Daya Manusia',
  5: 'Keuangan, Sarana, dan Prasarana',
  6: 'Pendidikan',
  7: 'Penelitian',
  8: 'Pengabdian kepada Masyarakat',
  9: 'Luaran dan Capaian Tridharma',
};

@Injectable()
export class LedService {
  constructor(private prisma: PrismaService) {}

  async generate(dto: GenerateDocumentDto, userId: string) {
    return this.runLedGenerationPipeline(dto, userId, 'api');
  }

  async executeMcpTool(
    toolCode: string,
    dto: GenerateDocumentDto | CheckConsistencyDto,
    userId: string,
  ) {
    if (toolCode === LED_MCP_TOOL_CODE) {
      return this.runLedGenerationPipeline(dto as GenerateDocumentDto, userId, 'mcp');
    }

    if (toolCode === LED_CONSISTENCY_TOOL_CODE) {
      return this.checkConsistency(dto as CheckConsistencyDto, userId);
    }

    throw new NotFoundException(`MCP tool ${toolCode} tidak ditemukan`);
  }

  async getStatus(jobId: string) {
    const job = await this.prisma.documentGenerationJob.findUnique({
      where: { id: jobId },
      include: {
        outputs: {
          include: {
            sectionOutputs: true,
          },
        },
      },
    });

    if (!job) throw new NotFoundException('Document generation job tidak ditemukan');

    const snapshot = this.toObject(job.inputSnapshot);
    const requestedCriteria = this.extractCriteriaFromSnapshot(snapshot).length;
    const sectionDone = job.outputs[0]?.sectionOutputs.length ?? 0;
    const progress =
      job.jobStatus === 'COMPLETED'
        ? 100
        : Math.min(95, Math.round((sectionDone / Math.max(1, requestedCriteria)) * 100));

    return {
      success: true,
      data: {
        jobId: job.id,
        status: job.jobStatus,
        progress,
        outputs: job.outputs,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
      },
    };
  }

  async getDownload(jobId: string) {
    const job = await this.prisma.documentGenerationJob.findUnique({
      where: { id: jobId },
      include: {
        outputs: {
          include: {
            sectionOutputs: {
              include: {
                documentSection: true,
              },
              orderBy: {
                documentSection: {
                  sectionOrder: 'asc',
                },
              },
            },
          },
        },
      },
    });

    if (!job) throw new NotFoundException('Document generation job tidak ditemukan');

    const output = job.outputs[0];
    if (!output) throw new NotFoundException('Output belum tersedia');

    const sections = output.sectionOutputs.map((sectionOutput) => {
      const source = this.toObject(sectionOutput.sourceSnapshot);
      const evidenceBindings = Array.isArray(source.evidenceBindings)
        ? source.evidenceBindings
        : [];

      return {
        sectionCode: sectionOutput.documentSection.sectionCode,
        sectionName: sectionOutput.documentSection.sectionName,
        sectionText: sectionOutput.sectionText,
        evidenceBindings,
      };
    });

    return {
      success: true,
      data: {
        jobId: job.id,
        title: output.title,
        status: output.status,
        docxFileKey: output.docxFileKey,
        pdfFileKey: output.pdfFileKey,
        generatedAt: output.generatedAt,
        sections,
      },
    };
  }

  async checkConsistency(dto: CheckConsistencyDto, userId: string) {
    await this.ensureConsistencyToolRegistry();

    const documentOutput = await this.prisma.documentOutput.findUnique({
      where: { id: dto.documentOutputId },
      include: {
        sectionOutputs: {
          include: {
            documentSection: true,
          },
          orderBy: {
            documentSection: {
              sectionOrder: 'asc',
            },
          },
        },
      },
    });

    if (!documentOutput) {
      throw new NotFoundException('Document output tidak ditemukan');
    }

    const selectedSections = dto.sectionCode
      ? documentOutput.sectionOutputs.filter(
          (item) => item.documentSection.sectionCode === dto.sectionCode,
        )
      : documentOutput.sectionOutputs;

    if (selectedSections.length === 0) {
      throw new BadRequestException('Section output tidak tersedia untuk checker');
    }

    const sourceFacts = this.collectSourceFacts(selectedSections);
    const evidenceBindings = this.collectEvidenceBindings(selectedSections);
    const draftText = (dto.draftText ?? '').trim().length > 0
      ? dto.draftText!.trim()
      : selectedSections.map((item) => item.sectionText).join('\n\n');

    if (!draftText) {
      throw new BadRequestException('Draft text kosong, checker tidak dapat dijalankan');
    }

    const consistencyFindings = this.runDocumentConsistencyChecker(draftText, sourceFacts);
    const complianceFindings = this.runComplianceChecker(draftText, evidenceBindings);

    const hasRedFlag =
      consistencyFindings.some((item) => item.status === 'FLAG_MERAH')
      || complianceFindings.some((item) => item.status === 'RED_FLAG');

    const persisted = dto.persist ?? true;
    let savedCount = 0;

    if (persisted) {
      savedCount = await this.persistDocumentCheckResults(
        documentOutput.id,
        consistencyFindings,
        complianceFindings,
        {
          sectionCode: dto.sectionCode ?? null,
          sourceFacts,
          userId,
          systemPrompt: CONSISTENCY_SYSTEM_PROMPT,
          checkedAt: new Date().toISOString(),
        },
      );
    }

    const results = await this.prisma.validationResult.findMany({
      where: {
        documentOutputId: documentOutput.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return {
      success: true,
      data: {
        toolCode: LED_CONSISTENCY_TOOL_CODE,
        status: hasRedFlag ? 'FLAG_MERAH' : 'LOLOS',
        summary: {
          consistencyChecked: consistencyFindings.length,
          complianceChecked: complianceFindings.length,
          redFlags:
            consistencyFindings.filter((item) => item.status === 'FLAG_MERAH').length
            + complianceFindings.filter((item) => item.status === 'RED_FLAG').length,
          warnings: complianceFindings.filter((item) => item.status === 'WARNING').length,
        },
        consistency: consistencyFindings,
        compliance: complianceFindings,
        savedCount,
        sourceFacts,
        systemPrompt: CONSISTENCY_SYSTEM_PROMPT,
        validationResults: results,
      },
    };
  }

  async getValidationResults(documentOutputId: string, take?: number) {
    const normalizedTake =
      typeof take === 'number' && Number.isFinite(take) && take > 0
        ? Math.min(Math.floor(take), 200)
        : 100;

    const data = await this.prisma.validationResult.findMany({
      where: {
        documentOutputId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: normalizedTake,
    });

    return {
      success: true,
      data,
      meta: {
        total: data.length,
      },
    };
  }

  async findAllJobs(query: { institutionId?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (query.institutionId) where.institutionId = query.institutionId;
    if (query.status) where.jobStatus = query.status.toUpperCase();

    const data = await this.prisma.documentGenerationJob.findMany({
      where,
      include: {
        documentDefinition: true,
        outputs: {
          include: {
            sectionOutputs: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    return { success: true, data, meta: { total: data.length } };
  }

  private async runLedGenerationPipeline(
    dto: GenerateDocumentDto,
    userId: string,
    channel: 'api' | 'mcp',
  ) {
    const criteria = this.resolveCriteria(dto);
    const context = await this.loadLedContext(dto);
    const requestedFormat = dto.format ?? 'docx';
    const startedAt = new Date();

    const toolRegistry = await this.ensureLedGenerateToolRegistry();

    let jobId: string | null = null;
    let toolExecutionLogId: string | null = null;

    try {
      const job = await this.prisma.documentGenerationJob.create({
        data: {
          documentDefinitionId: dto.documentDefinitionId,
          institutionId: dto.institutionId,
          studyProgramId: dto.studyProgramId,
          academicYearId: context.academicYear?.id,
          requestedBy: userId,
          jobStatus: 'PROCESSING',
          startedAt,
          notes: dto.notes,
          inputSnapshot: {
            criteria,
            requestedFormat,
            year: dto.year,
            channel,
            institutionId: dto.institutionId,
            studyProgramId: dto.studyProgramId,
            academicYearId: context.academicYear?.id,
          },
        },
      });
      jobId = job.id;

      const toolExecution = await this.prisma.toolExecutionLog.create({
        data: {
          toolRegistryId: toolRegistry.id,
          documentGenerationJobId: job.id,
          inputPayload: {
            criteria,
            requestedFormat,
            institutionId: dto.institutionId,
            studyProgramId: dto.studyProgramId,
            academicYearId: context.academicYear?.id,
            documentDefinitionId: dto.documentDefinitionId,
            channel,
          },
          executionStatus: 'processing',
          startedAt,
        },
      });
      toolExecutionLogId = toolExecution.id;

      const output = await this.prisma.documentOutput.create({
        data: {
          documentGenerationJobId: job.id,
          documentDefinitionId: dto.documentDefinitionId,
          title: this.buildOutputTitle(context, criteria),
          versionNo: 1,
          status: 'processing',
          generatedAt: startedAt,
        },
      });

      const consistencyState = new Map<string, string>();
      const artifacts: CriterionArtifact[] = [];

      for (const criterionNo of criteria) {
        const artifact = await this.generateCriterionArtifact(
          criterionNo,
          dto.documentDefinitionId,
          context,
          consistencyState,
        );
        artifacts.push(artifact);

        const section = await this.prisma.documentSection.findFirst({
          where: {
            documentDefinitionId: dto.documentDefinitionId,
            sectionCode: artifact.sectionCode,
          },
        });

        if (!section) {
          throw new BadRequestException(
            `Section ${artifact.sectionCode} tidak ditemukan untuk documentDefinitionId ${dto.documentDefinitionId}`,
          );
        }

        await this.prisma.documentSectionOutput.create({
          data: {
            documentOutputId: output.id,
            documentSectionId: section.id,
            sectionText: artifact.narrative,
            sourceSnapshot: this.asJson({
              structuredData: artifact.structuredData,
              ragSources: artifact.ragSources,
              evidenceBindings: artifact.evidenceBindings,
              facts: artifact.facts,
            }),
            generationMeta: this.asJson({
              model: process.env.LED_LLM_MODEL ?? 'rule-based-fallback',
              prompt: artifact.prompt,
              consistency: artifact.consistency,
              generatedAt: new Date().toISOString(),
            }),
          },
        });

        await this.persistConsistencyResult(output.id, artifact);
      }

      const finishedAt = new Date();
      const baseFileKey = `outputs/led/${job.id}`;

      await this.prisma.documentOutput.update({
        where: { id: output.id },
        data: {
          status: 'completed',
          docxFileKey: requestedFormat === 'docx' ? `${baseFileKey}.docx` : null,
          pdfFileKey: requestedFormat === 'pdf' ? `${baseFileKey}.pdf` : null,
          generatedAt: finishedAt,
        },
      });

      await this.prisma.documentGenerationJob.update({
        where: { id: job.id },
        data: {
          jobStatus: 'COMPLETED',
          finishedAt,
          inputSnapshot: this.asJson({
            criteria,
            requestedFormat,
            year: dto.year,
            channel,
            institutionId: dto.institutionId,
            studyProgramId: dto.studyProgramId,
            academicYearId: context.academicYear?.id,
            generatedSections: artifacts.map((artifact) => ({
              criterionNo: artifact.criterionNo,
              criterionCode: artifact.criterionCode,
              sectionCode: artifact.sectionCode,
              sectionName: artifact.sectionName,
              evidenceCount: artifact.evidenceBindings.length,
              consistency: artifact.consistency,
            })),
          }),
        },
      });

      if (toolExecutionLogId) {
        await this.prisma.toolExecutionLog.update({
          where: { id: toolExecutionLogId },
          data: {
            executionStatus: 'completed',
            finishedAt,
            outputPayload: {
              jobId: job.id,
              outputId: output.id,
              criteria,
              status: 'COMPLETED',
              generatedSections: artifacts.length,
            },
          },
        });
      }

      return {
        success: true,
        data: {
          jobId: job.id,
          status: 'COMPLETED',
          progress: 100,
          startedAt,
          finishedAt,
        },
      };
    } catch (error) {
      const finishedAt = new Date();
      const message = error instanceof Error ? error.message : 'Unknown LED generation error';

      if (jobId) {
        await this.prisma.documentGenerationJob.update({
          where: { id: jobId },
          data: {
            jobStatus: 'FAILED',
            finishedAt,
            notes: `${dto.notes ?? ''}\n[LED_GENERATION_ERROR] ${message}`.trim(),
          },
        });
      }

      if (toolExecutionLogId) {
        await this.prisma.toolExecutionLog.update({
          where: { id: toolExecutionLogId },
          data: {
            executionStatus: 'failed',
            finishedAt,
            outputPayload: {
              error: message,
            },
          },
        });
      }

      throw error;
    }
  }

  private async generateCriterionArtifact(
    criterionNo: LedCriterionNo,
    documentDefinitionId: string,
    context: LedContext,
    consistencyState: Map<string, string>,
  ): Promise<CriterionArtifact> {
    const criterionCode = `C${criterionNo}`;
    const sectionCode = `LED-C${criterionNo}`;
    const sectionName = CRITERIA_LABELS[criterionNo];

    const evidenceBindings = await this.fetchEvidenceBindings(
      documentDefinitionId,
      criterionCode,
      context,
    );

    const retrieval = this.retrieveStructuredDataForCriterion(
      criterionNo,
      context,
      evidenceBindings,
    );

    const prompt = this.buildPrompt(criterionNo, retrieval.structuredData);
    const generated = await this.generateNarrative(prompt, retrieval.structuredData, retrieval.facts);
    const withEvidence = this.bindEvidence(generated, evidenceBindings);
    const consistency = this.runConsistencyEngine(withEvidence, retrieval.facts, consistencyState);

    return {
      criterionNo,
      criterionCode,
      sectionCode,
      sectionName,
      ragSources: retrieval.ragSources,
      structuredData: retrieval.structuredData,
      facts: retrieval.facts,
      prompt,
      narrative: consistency.finalText,
      evidenceBindings,
      consistency: consistency.report,
    };
  }

  private retrieveStructuredDataForCriterion(
    criterionNo: LedCriterionNo,
    context: LedContext,
    evidenceBindings: EvidenceBinding[],
  ): {
    structuredData: Record<string, unknown>;
    ragSources: RagSource[];
    facts: CriterionFacts;
  } {
    const rag = context.ragSnapshot;

    switch (criterionNo) {
      case 1: {
        const structuredData = {
          institution: context.institution,
          studyProgram: context.studyProgram,
          vmts: rag.vmts,
          organizationalScope: {
            activeStudyProgramsTotal: rag.activeStudyProgramsTotal,
            organizationUnitsTotal: rag.organizationUnitsTotal,
          },
        };

        const facts: CriterionFacts = {
          active_study_programs_total: rag.activeStudyProgramsTotal,
          organization_units_total: rag.organizationUnitsTotal,
          vmts_version: rag.vmts?.versionNo ?? 0,
        };

        const ragSources: RagSource[] = [
          {
            source: 'vmts',
            relevanceScore: 0.99,
            reason: 'VMTS adalah sumber utama narasi kriteria C1.',
            payload: rag.vmts,
          },
          {
            source: 'institutions',
            relevanceScore: 0.95,
            reason: 'Profil institusi dibutuhkan untuk konteks strategis.',
            payload: context.institution,
          },
        ];

        return { structuredData, ragSources, facts };
      }

      case 2: {
        const structuredData = {
          institution: context.institution,
          studyProgram: context.studyProgram,
          governance: {
            organizationUnitsTotal: rag.organizationUnitsTotal,
            activeStudyProgramsTotal: rag.activeStudyProgramsTotal,
          },
          evidenceBindings,
        };

        const facts: CriterionFacts = {
          organization_units_total: rag.organizationUnitsTotal,
          active_study_programs_total: rag.activeStudyProgramsTotal,
          supporting_evidence_total: evidenceBindings.length,
        };

        const ragSources: RagSource[] = [
          {
            source: 'organization_units',
            relevanceScore: 0.96,
            reason: 'Data struktur tata kelola diambil dari unit organisasi.',
            payload: {
              organizationUnitsTotal: rag.organizationUnitsTotal,
              activeStudyProgramsTotal: rag.activeStudyProgramsTotal,
            },
          },
          {
            source: 'evidence_mappings',
            relevanceScore: 0.88,
            reason: 'Dokumen bukti pemetaan C2 dipakai untuk evidence binding.',
            payload: evidenceBindings,
          },
        ];

        return { structuredData, ragSources, facts };
      }

      case 3: {
        const structuredData = {
          institution: context.institution,
          studyProgram: context.studyProgram,
          academicYear: context.academicYear,
          studentsSummary: rag.students,
        };

        const facts: CriterionFacts = {
          applicants_total: rag.students?.applicantsTotal ?? 0,
          new_students_total: rag.students?.newStudentsTotal ?? 0,
          active_students_total: rag.students?.activeStudentsTotal ?? 0,
          dropout_rate_pct: rag.students?.dropoutRatePct ?? 0,
          student_achievements_total: rag.students?.studentAchievementsTotal ?? 0,
          mbkm_students_total: rag.students?.mbkmStudentsTotal ?? 0,
        };

        const ragSources: RagSource[] = [
          {
            source: 'students_summary',
            relevanceScore: 0.99,
            reason: 'Data mahasiswa dan tren penerimaan berasal dari students_summary.',
            payload: rag.students,
          },
        ];

        return { structuredData, ragSources, facts };
      }

      case 4: {
        const activeStudents = rag.students?.activeStudentsTotal ?? 0;
        const permanentLecturers = rag.lecturers?.permanentCount ?? 0;
        const lecturerStudentRatio =
          activeStudents > 0 && permanentLecturers > 0
            ? Number((activeStudents / permanentLecturers).toFixed(2))
            : 0;

        const structuredData = {
          institution: context.institution,
          studyProgram: context.studyProgram,
          academicYear: context.academicYear,
          lecturersSummary: rag.lecturers,
          supportingStudentsSummary: {
            activeStudentsTotal: activeStudents,
            lecturerStudentRatio,
          },
        };

        const facts: CriterionFacts = {
          permanent_lecturers_total: rag.lecturers?.permanentCount ?? 0,
          non_permanent_lecturers_total: rag.lecturers?.nonPermanentCount ?? 0,
          masters_lecturers_total: rag.lecturers?.mastersCount ?? 0,
          doctoral_lecturers_total: rag.lecturers?.doctoralCount ?? 0,
          lecturer_certified_total: rag.lecturers?.lecturerCertifiedCount ?? 0,
          active_students_total: activeStudents,
          lecturer_student_ratio: lecturerStudentRatio,
        };

        const ragSources: RagSource[] = [
          {
            source: 'lecturers_summary',
            relevanceScore: 0.99,
            reason: 'Kualifikasi dan komposisi dosen diambil langsung dari lecturers_summary.',
            payload: rag.lecturers,
          },
          {
            source: 'students_summary',
            relevanceScore: 0.91,
            reason: 'Rasio dosen mahasiswa membutuhkan pembanding jumlah mahasiswa aktif.',
            payload: {
              activeStudentsTotal: activeStudents,
              lecturerStudentRatio,
            },
          },
        ];

        return { structuredData, ragSources, facts };
      }

      case 5: {
        const structuredData = {
          institution: context.institution,
          studyProgram: context.studyProgram,
          academicYear: context.academicYear,
          financeSummary: rag.finance,
          facilitiesSummary: rag.facilities,
        };

        const facts: CriterionFacts = {
          operational_budget: rag.finance?.operationalBudget ?? 0,
          research_budget: rag.finance?.researchBudget ?? 0,
          service_budget: rag.finance?.serviceBudget ?? 0,
          scholarship_budget: rag.finance?.scholarshipBudget ?? 0,
          classrooms_total: rag.facilities?.classroomsTotal ?? 0,
          labs_total: rag.facilities?.labsTotal ?? 0,
          library_collections_total: rag.facilities?.libraryCollectionsTotal ?? 0,
          internet_coverage_pct: rag.facilities?.internetCoveragePct ?? 0,
        };

        const ragSources: RagSource[] = [
          {
            source: 'finance_summary',
            relevanceScore: 0.99,
            reason: 'Indikator keuangan utama berasal dari finance_summary.',
            payload: rag.finance,
          },
          {
            source: 'facilities_summary',
            relevanceScore: 0.97,
            reason: 'Kondisi sarana dan prasarana berasal dari facilities_summary.',
            payload: rag.facilities,
          },
        ];

        return { structuredData, ragSources, facts };
      }

      case 6: {
        const structuredData = {
          institution: context.institution,
          studyProgram: context.studyProgram,
          academicYear: context.academicYear,
          educationSummary: rag.education,
          lecturersSummary: rag.lecturers,
          studentsSummary: rag.students,
        };

        const facts: CriterionFacts = {
          obe_implemented_pct: rag.education?.obeImplementedPct ?? 0,
          rps_complete_pct: rag.education?.rpsCompletePct ?? 0,
          mbkm_courses_pct: rag.education?.mbkmCoursesPct ?? 0,
          permanent_lecturers_total: rag.lecturers?.permanentCount ?? 0,
          active_students_total: rag.students?.activeStudentsTotal ?? 0,
        };

        const ragSources: RagSource[] = [
          {
            source: 'education_summary',
            relevanceScore: 0.99,
            reason: 'Progress implementasi pendidikan OBE ditarik dari education_summary.',
            payload: rag.education,
          },
          {
            source: 'lecturers_summary',
            relevanceScore: 0.86,
            reason: 'Kualitas proses pendidikan dipengaruhi kapasitas dosen.',
            payload: rag.lecturers,
          },
        ];

        return { structuredData, ragSources, facts };
      }

      case 7: {
        const structuredData = {
          institution: context.institution,
          studyProgram: context.studyProgram,
          academicYear: context.academicYear,
          researchSummary: rag.research,
        };

        const facts: CriterionFacts = {
          research_grants_total: rag.research?.grantsTotal ?? 0,
          publications_total: rag.research?.publicationsTotal ?? 0,
          scopus_total: rag.research?.scopusTotal ?? 0,
          ipr_total: rag.research?.iprTotal ?? 0,
          citation_total: rag.research?.citationTotal ?? 0,
        };

        const ragSources: RagSource[] = [
          {
            source: 'research_summary',
            relevanceScore: 0.99,
            reason: 'Semua indikator penelitian diambil dari research_summary.',
            payload: rag.research,
          },
        ];

        return { structuredData, ragSources, facts };
      }

      case 8: {
        const structuredData = {
          institution: context.institution,
          studyProgram: context.studyProgram,
          academicYear: context.academicYear,
          serviceSummary: rag.service,
        };

        const facts: CriterionFacts = {
          service_programs_total: rag.service?.programsTotal ?? 0,
          service_partners_total: rag.service?.partnersTotal ?? 0,
          service_outputs_total: rag.service?.outputsTotal ?? 0,
        };

        const ragSources: RagSource[] = [
          {
            source: 'service_summary',
            relevanceScore: 0.99,
            reason: 'Aktivitas PkM berasal dari service_summary.',
            payload: rag.service,
          },
        ];

        return { structuredData, ragSources, facts };
      }

      case 9: {
        const structuredData = {
          institution: context.institution,
          studyProgram: context.studyProgram,
          academicYear: context.academicYear,
          graduatesOutcomes: rag.graduates,
          studentsSummary: rag.students,
          ikuValues: rag.ikuValues,
          researchSummary: rag.research,
          serviceSummary: rag.service,
        };

        const facts: CriterionFacts = {
          avg_gpa: rag.graduates?.avgGpa ?? 0,
          avg_study_period_years: rag.graduates?.avgStudyPeriodYears ?? 0,
          employment_wait_months: rag.graduates?.employmentWaitMonths ?? 0,
          field_alignment_pct: rag.graduates?.fieldAlignmentPct ?? 0,
          continuing_study_pct: rag.graduates?.continuingStudyPct ?? 0,
          student_achievements_total: rag.students?.studentAchievementsTotal ?? 0,
          iku_metrics_total: rag.ikuValues.length,
          publications_total: rag.research?.publicationsTotal ?? 0,
          service_outputs_total: rag.service?.outputsTotal ?? 0,
        };

        const ragSources: RagSource[] = [
          {
            source: 'graduates_outcomes',
            relevanceScore: 0.99,
            reason: 'Indikator luaran lulusan diambil dari graduates_outcomes.',
            payload: rag.graduates,
          },
          {
            source: 'iku_values',
            relevanceScore: 0.95,
            reason: 'IKU dipakai sebagai penguat capaian kinerja tridharma.',
            payload: rag.ikuValues,
          },
        ];

        return { structuredData, ragSources, facts };
      }

      default:
        throw new BadRequestException(`Kriteria ${criterionNo} tidak didukung`);
    }
  }

  private buildPrompt(criterionNo: LedCriterionNo, structuredData: Record<string, unknown>) {
    const structuredDataJson = JSON.stringify(structuredData, null, 2);
    return `SISTEM: Kamu adalah penyusun LED BAN-PT profesional. Tulis narasi Kriteria ${criterionNo} berdasarkan data berikut: ${structuredDataJson}. Gunakan bahasa formal akademik. Struktur tulisan harus mencakup: 1) Deskripsi kondisi eksisting, 2) Analisis kekuatan, 3) Identifikasi kelemahan, 4) Rencana tindak lanjut. Panjang tulisan: 300-500 kata`;
  }

  private async generateNarrative(
    prompt: string,
    structuredData: Record<string, unknown>,
    facts: CriterionFacts,
  ) {
    const openAiNarrative = await this.generateWithOpenAI(prompt);
    if (openAiNarrative) return openAiNarrative;

    return this.generateRuleBasedNarrative(structuredData, facts);
  }

  private async generateWithOpenAI(prompt: string): Promise<string | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.LED_LLM_MODEL ?? 'gpt-4.1-mini',
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'Kamu adalah penulis akademik untuk dokumen LED BAN-PT. Pastikan seluruh angka persis sama dengan data input.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) return null;

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = payload.choices?.[0]?.message?.content?.trim();
      return text || null;
    } catch {
      return null;
    }
  }

  private generateRuleBasedNarrative(
    structuredData: Record<string, unknown>,
    facts: CriterionFacts,
  ) {
    const factEntries = Object.entries(facts);
    const keyFactsSentence =
      factEntries.length > 0
        ? factEntries
            .map(([key, value]) => `${this.humanizeFactKey(key)} ${this.formatFactValue(value)}`)
            .join(', ')
        : 'Data numerik belum tersedia secara memadai pada snapshot saat ini';

    const institutionName =
      this.toObject(structuredData.institution).name?.toString() ?? 'institusi terkait';

    const paragraph1 =
      `1) Deskripsi kondisi eksisting\n` +
      `${institutionName} menunjukkan kondisi pengelolaan mutu yang terukur berdasarkan data terstruktur terbaru di basis data internal. ` +
      `Snapshot ini memuat indikator kuantitatif dan kualitatif yang menjadi landasan penyusunan narasi LED secara objektif. ` +
      `Fakta utama yang ditarik melalui proses retrieval adalah: ${keyFactsSentence}. ` +
      `Seluruh angka tersebut diambil dari tabel ringkasan akademik dan akreditasi sesuai konteks tahun akademik yang dipilih, sehingga representasi kondisi eksisting bersifat audit-ready untuk kebutuhan evaluasi diri.`;

    const paragraph2 =
      `2) Analisis kekuatan\n` +
      `Kekuatan utama terlihat pada konsistensi ketersediaan data lintas domain tridharma dan dukungan tata kelola institusi. ` +
      `Integrasi data ini memungkinkan analisis yang tidak parsial antara profil institusi, sumber daya, proses pendidikan, serta luaran. ` +
      `Selain itu, indikator yang telah terdokumentasi menunjukkan arah pengembangan yang dapat dipertanggungjawabkan, termasuk pemetaan bukti pada setiap kriteria. ` +
      `Kondisi ini memperkuat kredibilitas narasi LED karena setiap argumentasi dapat ditelusuri kembali ke sumber data primer dan jejak pengelolaan dokumen.`;

    const paragraph3 =
      `3) Identifikasi kelemahan\n` +
      `Meskipun data inti telah tersedia, masih terdapat ruang perbaikan pada aspek kedalaman narasi dan pemerataan dukungan bukti antar kriteria. ` +
      `Sebagian indikator membutuhkan pemutakhiran berkala agar tren performa dapat dibaca lebih tajam dari tahun ke tahun. ` +
      `Di sisi lain, ketergantungan pada data ringkasan tanpa narasi analitik lanjutan berpotensi menurunkan daya jelaskan terhadap akar masalah. ` +
      `Karena itu, validasi konsistensi angka dan penguatan bukti pendukung harus dijaga agar tidak terjadi deviasi informasi saat proses asesmen.`;

    const paragraph4 =
      `4) Rencana tindak lanjut\n` +
      `Tindak lanjut difokuskan pada penguatan siklus data-driven improvement. ` +
      `Pertama, lakukan pembaruan snapshot secara periodik dan sinkronkan indikator strategis dengan target renstra. ` +
      `Kedua, tingkatkan kualitas narasi dengan analisis sebab akibat berbasis bukti agar rekomendasi lebih operasional pada tingkat prodi dan institusi. ` +
      `Ketiga, pastikan seluruh angka kunci selalu melewati pemeriksaan konsistensi lintas dokumen sebelum finalisasi keluaran LED. ` +
      `Keempat, perluas evidence binding untuk setiap kriteria agar setiap klaim dapat diverifikasi melalui dokumen formal yang tersimpan di storage.`;

    return [paragraph1, paragraph2, paragraph3, paragraph4].join('\n\n');
  }

  private bindEvidence(narrative: string, evidenceBindings: EvidenceBinding[]) {
    if (evidenceBindings.length === 0) {
      return `${narrative}\n\nDaftar Bukti Pendukung\n- Belum ditemukan evidence mapping untuk kriteria ini pada document definition saat ini.`;
    }

    const evidenceLines = evidenceBindings
      .slice(0, 10)
      .map(
        (item) =>
          `- ${item.evidenceCode}: ${item.title} | tipe: ${item.documentType ?? '-'} | file_key: ${item.fileKey ?? '-'}`,
      )
      .join('\n');

    return `${narrative}\n\nDaftar Bukti Pendukung\n${evidenceLines}`;
  }

  private runConsistencyEngine(
    narrative: string,
    facts: CriterionFacts,
    consistencyState: Map<string, string>,
  ): { finalText: string; report: ConsistencyReport } {
    const missingFacts: string[] = [];
    const crossDocumentConflicts: string[] = [];

    for (const [factKey, value] of Object.entries(facts)) {
      const valueText = this.formatFactValue(value);
      const existed = consistencyState.get(factKey);

      if (existed && existed !== valueText) {
        crossDocumentConflicts.push(
          `${factKey}: nilai sebelumnya ${existed}, nilai saat ini ${valueText}`,
        );
      }
      consistencyState.set(factKey, valueText);

      if (!narrative.includes(valueText)) {
        missingFacts.push(`${factKey}=${valueText}`);
      }
    }

    let finalText = narrative;
    if (missingFacts.length > 0 || crossDocumentConflicts.length > 0) {
      const missingLines =
        missingFacts.length > 0
          ? `Nilai wajib yang ditegaskan ulang:\n${missingFacts.map((item) => `- ${item}`).join('\n')}`
          : null;

      const conflictLines =
        crossDocumentConflicts.length > 0
          ? `Konflik lintas dokumen yang ditemukan:\n${crossDocumentConflicts
              .map((item) => `- ${item}`)
              .join('\n')}`
          : null;

      finalText = `${narrative}\n\nLampiran Konsistensi Data\n${[missingLines, conflictLines]
        .filter(Boolean)
        .join('\n\n')}`;
    }

    return {
      finalText,
      report: {
        passed: crossDocumentConflicts.length === 0,
        repaired: missingFacts.length > 0 || crossDocumentConflicts.length > 0,
        missingFacts,
        crossDocumentConflicts,
      },
    };
  }

  private async persistConsistencyResult(outputId: string, artifact: CriterionArtifact) {
    const { consistency, criterionNo } = artifact;

    if (!consistency.repaired && consistency.passed) {
      return;
    }

    await this.prisma.validationResult.create({
      data: {
        documentOutputId: outputId,
        validationType: 'CONSISTENCY',
        severity: consistency.passed ? 'WARNING' : 'RED_FLAG',
        ruleCode: `AUTO-LED-C${criterionNo}-CONSISTENCY`,
        message: consistency.passed
          ? `Consistency checker menambahkan penegasan data numerik untuk C${criterionNo}.`
          : `Consistency checker menemukan konflik lintas dokumen untuk C${criterionNo}.`,
        details: this.asJson(consistency),
      },
    });
  }

  private collectSourceFacts(
    sections: Array<{ sourceSnapshot: unknown }>,
  ): Record<string, number> {
    const mergedFacts: Record<string, number> = {};

    for (const section of sections) {
      const source = this.toObject(section.sourceSnapshot);
      const facts = this.toObject(source.facts);

      for (const [key, value] of Object.entries(facts)) {
        const numericValue = this.normalizeNumericValue(value);
        if (numericValue === null) {
          continue;
        }
        mergedFacts[key] = numericValue;
      }
    }

    return mergedFacts;
  }

  private collectEvidenceBindings(
    sections: Array<{ sourceSnapshot: unknown }>,
  ): EvidenceBinding[] {
    const bindings: EvidenceBinding[] = [];

    for (const section of sections) {
      const source = this.toObject(section.sourceSnapshot);
      const rawBindings = Array.isArray(source.evidenceBindings)
        ? source.evidenceBindings
        : [];

      for (const rawBinding of rawBindings) {
        const item = this.toObject(rawBinding);
        bindings.push({
          evidenceId: String(item.evidenceId ?? ''),
          evidenceCode: String(item.evidenceCode ?? '-'),
          title: String(item.title ?? 'Tanpa judul'),
          documentType: item.documentType ? String(item.documentType) : null,
          fileKey: item.fileKey ? String(item.fileKey) : null,
          fileName: item.fileName ? String(item.fileName) : null,
          criterionCode: item.criterionCode ? String(item.criterionCode) : null,
          mappingNote: item.mappingNote ? String(item.mappingNote) : null,
        });
      }
    }

    return bindings;
  }

  private runDocumentConsistencyChecker(
    draftText: string,
    sourceFacts: Record<string, number>,
  ): ConsistencyClaimFinding[] {
    const findings: ConsistencyClaimFinding[] = [];
    const sentences = this.splitSentences(draftText);

    for (const sentence of sentences) {
      if (!/\d/.test(sentence)) {
        continue;
      }

      const sentenceLower = sentence.toLowerCase();
      const sentenceNumbers = this.extractNumericTokens(sentence);
      if (sentenceNumbers.length === 0) {
        continue;
      }

      for (const [metricKey, expected] of Object.entries(sourceFacts)) {
        const aliases = this.getMetricAliases(metricKey);
        const isMetricMentioned = aliases.some(
          (alias) => alias.length > 0 && sentenceLower.includes(alias),
        );

        if (!isMetricMentioned) {
          continue;
        }

        const foundValue = sentenceNumbers[0] ?? '';
        const expectedValue = String(expected);
        const foundNumber = this.normalizeNumericValue(foundValue);
        const expectedNumber = this.normalizeNumericValue(expected);

        if (foundNumber === null || expectedNumber === null) {
          continue;
        }

        const same = Math.abs(foundNumber - expectedNumber) < 0.01;

        findings.push({
          status: same ? 'LOLOS' : 'FLAG_MERAH',
          metricKey,
          sentence,
          expectedValue,
          foundValue,
          reason: same
            ? 'Angka pada teks konsisten dengan data sumber.'
            : 'Angka pada teks berbeda dengan data sumber.',
        });
      }
    }

    if (findings.length > 0) {
      return findings;
    }

    return [
      {
        status: 'LOLOS',
        metricKey: 'NO_NUMERIC_CONFLICT',
        sentence: 'Tidak ditemukan konflik numerik yang dapat dipetakan pada draf.',
        expectedValue: '-',
        foundValue: '-',
        reason: 'Checker tidak menemukan perbedaan angka terhadap sumber data.',
      },
    ];
  }

  private runComplianceChecker(
    draftText: string,
    evidenceBindings: EvidenceBinding[],
  ): ComplianceFinding[] {
    const findings: ComplianceFinding[] = [];
    const draftTextLower = draftText.toLowerCase();

    const requiredBlocks = [
      'deskripsi kondisi eksisting',
      'analisis kekuatan',
      'identifikasi kelemahan',
      'rencana tindak lanjut',
    ];

    const missingBlocks = requiredBlocks.filter(
      (block) => !draftTextLower.includes(block),
    );

    if (missingBlocks.length > 0) {
      findings.push({
        status: 'WARNING',
        ruleCode: 'CHECKER-COMPLIANCE-STRUCTURE',
        message: `Struktur narasi belum lengkap. Bagian yang belum ditemukan: ${missingBlocks.join(', ')}.`,
        missingEvidence: missingBlocks,
      });
    }

    const mentionPolicy = /kebijakan|surat keputusan|\bsk\b|peraturan|pedoman/i.test(
      draftTextLower,
    );

    const policyEvidence = evidenceBindings.filter((item) => {
      const searchable = `${item.evidenceCode} ${item.title} ${item.fileName ?? ''} ${item.fileKey ?? ''}`
        .toLowerCase();
      return /\bsk\b|surat keputusan|kebijakan|peraturan|pedoman/.test(searchable)
        && Boolean(item.fileKey);
    });

    if (mentionPolicy && policyEvidence.length === 0) {
      findings.push({
        status: 'RED_FLAG',
        ruleCode: 'CHECKER-COMPLIANCE-MISSING_EVIDENCE',
        message:
          'Narasi menyebut dokumen kebijakan namun tidak ada file SK yang tertaut pada evidence binding (Missing Evidence).',
        missingEvidence: ['File SK atau dokumen kebijakan belum terhubung dari storage MinIO.'],
      });
    }

    const evidenceWithoutFile = evidenceBindings
      .filter((item) => !item.fileKey)
      .map((item) => `${item.evidenceCode} - ${item.title}`);

    if (evidenceWithoutFile.length > 0) {
      findings.push({
        status: 'WARNING',
        ruleCode: 'CHECKER-COMPLIANCE-EVIDENCE_FILE_MISSING',
        message:
          'Sebagian evidence mapping belum memiliki file_key, sehingga verifikasi bukti belum lengkap.',
        missingEvidence: evidenceWithoutFile,
      });
    }

    if (findings.length > 0) {
      return findings;
    }

    return [
      {
        status: 'LOLOS',
        ruleCode: 'CHECKER-COMPLIANCE-PASS',
        message: 'Struktur narasi dan evidence utama memenuhi pemeriksaan compliance.',
      },
    ];
  }

  private async persistDocumentCheckResults(
    documentOutputId: string,
    consistencyFindings: ConsistencyClaimFinding[],
    complianceFindings: ComplianceFinding[],
    metadata: Record<string, unknown>,
  ) {
    await this.prisma.validationResult.deleteMany({
      where: {
        documentOutputId,
        ruleCode: {
          startsWith: 'CHECKER-',
        },
      },
    });

    const toCreate = [] as Array<{
      documentOutputId: string;
      validationType: string;
      severity: string;
      ruleCode: string;
      message: string;
      details: any;
    }>;

    consistencyFindings
      .filter((item) => item.status === 'FLAG_MERAH')
      .forEach((item, index) => {
        toCreate.push({
          documentOutputId,
          validationType: 'CONSISTENCY',
          severity: 'RED_FLAG',
          ruleCode: `CHECKER-CONSISTENCY-${item.metricKey.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}-${index + 1}`,
          message: `FLAG MERAH: kalimat mengandung nilai ${item.foundValue}, seharusnya ${item.expectedValue}.`,
          details: this.asJson({
            checker: LED_CONSISTENCY_TOOL_CODE,
            systemPrompt: CONSISTENCY_SYSTEM_PROMPT,
            ...metadata,
            finding: item,
          }),
        });
      });

    complianceFindings
      .filter((item) => item.status !== 'LOLOS')
      .forEach((item, index) => {
        toCreate.push({
          documentOutputId,
          validationType: 'COMPLIANCE',
          severity: item.status === 'RED_FLAG' ? 'RED_FLAG' : 'WARNING',
          ruleCode: `${item.ruleCode}-${index + 1}`,
          message: item.message,
          details: this.asJson({
            checker: LED_CONSISTENCY_TOOL_CODE,
            ...metadata,
            finding: item,
          }),
        });
      });

    if (toCreate.length > 0) {
      await this.prisma.validationResult.createMany({
        data: toCreate,
      });
    }

    return toCreate.length;
  }

  private splitSentences(text: string) {
    return text
      .split(/\n+|(?<=[.!?])\s+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private extractNumericTokens(text: string) {
    return text.match(/-?\d[\d.,]*/g) ?? [];
  }

  private getMetricAliases(metricKey: string) {
    const keyAlias = metricKey.replace(/_/g, ' ').toLowerCase();
    const customAliases = FACT_KEYWORD_ALIASES[metricKey] ?? [];
    return [keyAlias, ...customAliases.map((item) => item.toLowerCase())];
  }

  private normalizeNumericValue(value: unknown): number | null {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const cleaned = value.replace(/[^\d,.-]/g, '').trim();
    if (!cleaned) {
      return null;
    }

    const hasDot = cleaned.includes('.');
    const hasComma = cleaned.includes(',');

    let normalized = cleaned;
    if (hasDot && hasComma) {
      normalized = cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');
    } else if (hasComma) {
      const parts = cleaned.split(',');
      normalized = parts.length === 2 && parts[1].length <= 2
        ? cleaned.replace(',', '.')
        : cleaned.replace(/,/g, '');
    }

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private async fetchEvidenceBindings(
    documentDefinitionId: string,
    criterionCode: string,
    context: LedContext,
  ): Promise<EvidenceBinding[]> {
    const mappings = await this.prisma.evidenceMapping.findMany({
      where: {
        documentDefinitionId,
        criterionCode,
      },
      include: {
        evidenceDocument: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return mappings
      .filter((mapping) => mapping.evidenceDocument.institutionId === context.institution.id)
      .map((mapping) => ({
        evidenceId: mapping.evidenceDocument.id,
        evidenceCode: mapping.evidenceDocument.evidenceCode,
        title: mapping.evidenceDocument.title,
        documentType: mapping.evidenceDocument.documentType,
        fileKey: mapping.evidenceDocument.fileKey,
        fileName: mapping.evidenceDocument.fileName,
        criterionCode: mapping.criterionCode,
        mappingNote: mapping.mappingNote,
      }));
  }

  private async ensureLedGenerateToolRegistry() {
    return this.prisma.toolRegistry.upsert({
      where: {
        toolCode: LED_MCP_TOOL_CODE,
      },
      update: {
        isActive: true,
      },
      create: {
        toolCode: LED_MCP_TOOL_CODE,
        toolName: 'LED Generate MCP Tool',
        isActive: true,
        inputSchema: {
          type: 'object',
          properties: {
            documentDefinitionId: { type: 'string' },
            institutionId: { type: 'string' },
            studyProgramId: { type: 'string' },
            academicYearId: { type: 'string' },
            criteria: {
              type: 'array',
              items: { type: 'integer', minimum: 1, maximum: 9 },
            },
            format: { type: 'string', enum: ['docx', 'pdf'] },
          },
          required: ['documentDefinitionId', 'institutionId'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            status: { type: 'string' },
            progress: { type: 'number' },
          },
          required: ['jobId', 'status'],
        },
      },
    });
  }

  private async ensureConsistencyToolRegistry() {
    return this.prisma.toolRegistry.upsert({
      where: {
        toolCode: LED_CONSISTENCY_TOOL_CODE,
      },
      update: {
        isActive: true,
      },
      create: {
        toolCode: LED_CONSISTENCY_TOOL_CODE,
        toolName: 'LED Document Consistency Checker',
        isActive: true,
        inputSchema: {
          type: 'object',
          properties: {
            documentOutputId: { type: 'string' },
            draftText: { type: 'string' },
            sectionCode: { type: 'string' },
            persist: { type: 'boolean' },
          },
          required: ['documentOutputId'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['LOLOS', 'FLAG_MERAH'] },
            consistency: { type: 'array' },
            compliance: { type: 'array' },
          },
          required: ['status'],
        },
      },
    });
  }

  private async loadLedContext(dto: GenerateDocumentDto): Promise<LedContext> {
    const institution = await this.prisma.institution.findUnique({
      where: { id: dto.institutionId },
      select: {
        id: true,
        code: true,
        name: true,
        alias: true,
        city: true,
        province: true,
        status: true,
        institutionType: true,
        focusArea: true,
      },
    });

    if (!institution) {
      throw new NotFoundException('Institution tidak ditemukan');
    }

    let studyProgram: LedContext['studyProgram'] = null;
    if (dto.studyProgramId) {
      const foundStudyProgram = await this.prisma.studyProgram.findUnique({
        where: { id: dto.studyProgramId },
        select: {
          id: true,
          code: true,
          name: true,
          degreeLevel: true,
          accreditationStatus: true,
          institutionId: true,
        },
      });

      if (!foundStudyProgram || foundStudyProgram.institutionId !== institution.id) {
        throw new NotFoundException('Study program tidak ditemukan untuk institusi ini');
      }

      studyProgram = {
        id: foundStudyProgram.id,
        code: foundStudyProgram.code,
        name: foundStudyProgram.name,
        degreeLevel: foundStudyProgram.degreeLevel,
        accreditationStatus: foundStudyProgram.accreditationStatus,
      };
    }

    let academicYear: LedContext['academicYear'] = null;
    if (dto.academicYearId) {
      const foundAcademicYear = await this.prisma.academicYear.findUnique({
        where: { id: dto.academicYearId },
        select: { id: true, institutionId: true, yearLabel: true },
      });

      if (!foundAcademicYear || foundAcademicYear.institutionId !== institution.id) {
        throw new NotFoundException('Academic year tidak ditemukan untuk institusi ini');
      }

      academicYear = {
        id: foundAcademicYear.id,
        yearLabel: foundAcademicYear.yearLabel,
      };
    } else if (dto.year) {
      const foundByYear = await this.prisma.academicYear.findFirst({
        where: {
          institutionId: institution.id,
          yearLabel: {
            startsWith: `${dto.year}/`,
          },
        },
        orderBy: { yearLabel: 'desc' },
        select: { id: true, yearLabel: true },
      });

      if (foundByYear) {
        academicYear = foundByYear;
      }
    }

    if (!academicYear) {
      academicYear = await this.prisma.academicYear.findFirst({
        where: {
          institutionId: institution.id,
          isActive: true,
        },
        orderBy: { yearLabel: 'desc' },
        select: { id: true, yearLabel: true },
      });
    }

    const summaryWhere: Record<string, unknown> = {
      institutionId: institution.id,
    };
    if (academicYear?.id) summaryWhere.academicYearId = academicYear.id;
    if (studyProgram?.id) summaryWhere.studyProgramId = studyProgram.id;

    const [
      vmts,
      students,
      graduates,
      lecturers,
      education,
      research,
      service,
      finance,
      facilities,
      ikuValues,
      organizationUnitsTotal,
      activeStudyProgramsTotal,
    ] = await Promise.all([
      this.prisma.vMTS.findFirst({
        where: {
          institutionId: institution.id,
          ...(studyProgram?.id
            ? {
                OR: [{ studyProgramId: studyProgram.id }, { studyProgramId: null }],
              }
            : {}),
        },
        orderBy: { versionNo: 'desc' },
        select: {
          id: true,
          vision: true,
          mission: true,
          goals: true,
          strategies: true,
          versionNo: true,
        },
      }),
      this.prisma.studentsSummary.findFirst({
        where: summaryWhere,
        orderBy: { id: 'desc' },
        select: {
          applicantsTotal: true,
          newStudentsTotal: true,
          activeStudentsTotal: true,
          dropoutRatePct: true,
          studentAchievementsTotal: true,
          mbkmStudentsTotal: true,
        },
      }),
      this.prisma.graduatesOutcomes.findFirst({
        where: summaryWhere,
        orderBy: { id: 'desc' },
        select: {
          avgGpa: true,
          avgStudyPeriodYears: true,
          employmentWaitMonths: true,
          fieldAlignmentPct: true,
          continuingStudyPct: true,
        },
      }),
      this.prisma.lecturersSummary.findFirst({
        where: summaryWhere,
        orderBy: { id: 'desc' },
        select: {
          permanentCount: true,
          nonPermanentCount: true,
          mastersCount: true,
          doctoralCount: true,
          professorCount: true,
          associateProfessorCount: true,
          lecturerCertifiedCount: true,
        },
      }),
      this.prisma.educationSummary.findFirst({
        where: summaryWhere,
        orderBy: { id: 'desc' },
        select: {
          obeImplementedPct: true,
          rpsCompletePct: true,
          mbkmCoursesPct: true,
          evaluationNotes: true,
        },
      }),
      this.prisma.researchSummary.findFirst({
        where: summaryWhere,
        orderBy: { id: 'desc' },
        select: {
          grantsTotal: true,
          publicationsTotal: true,
          scopusTotal: true,
          iprTotal: true,
          citationTotal: true,
        },
      }),
      this.prisma.serviceSummary.findFirst({
        where: summaryWhere,
        orderBy: { id: 'desc' },
        select: {
          programsTotal: true,
          partnersTotal: true,
          outputsTotal: true,
        },
      }),
      this.prisma.financeSummary.findFirst({
        where: {
          institutionId: institution.id,
          ...(academicYear?.id ? { academicYearId: academicYear.id } : {}),
        },
        orderBy: { id: 'desc' },
        select: {
          operationalBudget: true,
          researchBudget: true,
          serviceBudget: true,
          scholarshipBudget: true,
        },
      }),
      this.prisma.facilitiesSummary.findFirst({
        where: summaryWhere,
        orderBy: { id: 'desc' },
        select: {
          classroomsTotal: true,
          labsTotal: true,
          libraryCollectionsTotal: true,
          lmsAvailable: true,
          internetCoveragePct: true,
        },
      }),
      this.prisma.iKUValue.findMany({
        where: summaryWhere,
        orderBy: { ikuCode: 'asc' },
        take: 10,
        select: {
          ikuCode: true,
          valueNumeric: true,
          unit: true,
          validationStatus: true,
        },
      }),
      this.prisma.organizationUnit.count({
        where: {
          institutionId: institution.id,
        },
      }),
      this.prisma.studyProgram.count({
        where: {
          institutionId: institution.id,
          isActive: true,
        },
      }),
    ]);

    return {
      institution,
      studyProgram,
      academicYear,
      ragSnapshot: {
        vmts,
        students,
        graduates,
        lecturers,
        education,
        research,
        service,
        finance,
        facilities,
        ikuValues,
        organizationUnitsTotal,
        activeStudyProgramsTotal,
      },
    };
  }

  private resolveCriteria(dto: GenerateDocumentDto): LedCriterionNo[] {
    const directCriteria = this.normalizeCriteria(dto.criteria);
    if (directCriteria.length > 0) return directCriteria;

    const fromNotes = this.extractCriteriaFromNotes(dto.notes);
    if (fromNotes.length > 0) return fromNotes;

    return DEFAULT_CRITERIA;
  }

  private extractCriteriaFromNotes(notes?: string) {
    if (!notes) return [];

    const match = notes.match(/criteria\s*:\s*([0-9,\s]+)/i);
    if (!match?.[1]) return [];

    const parsed = match[1]
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((value) => Number.isInteger(value));

    return this.normalizeCriteria(parsed);
  }

  private normalizeCriteria(values?: number[]) {
    if (!values || values.length === 0) return [];

    const unique = Array.from(new Set(values));

    return unique
      .filter((value): value is LedCriterionNo => value >= 1 && value <= 9)
      .sort((a, b) => a - b);
  }

  private extractCriteriaFromSnapshot(snapshot: Record<string, unknown>) {
    const raw = snapshot.criteria;
    if (!Array.isArray(raw)) return DEFAULT_CRITERIA;

    const values = raw.filter((item): item is number => typeof item === 'number');
    const normalized = this.normalizeCriteria(values);
    return normalized.length > 0 ? normalized : DEFAULT_CRITERIA;
  }

  private buildOutputTitle(context: LedContext, criteria: LedCriterionNo[]) {
    const prodi = context.studyProgram?.name ? ` - ${context.studyProgram.name}` : '';
    const tahun = context.academicYear?.yearLabel ?? 'Tahun Aktif';
    const range = criteria.join(',');
    return `LED${prodi} (${tahun}) C${range}`;
  }

  private humanizeFactKey(key: string) {
    return key
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private formatFactValue(value: string | number) {
    return typeof value === 'number' ? value.toString() : value;
  }

  private toObject(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return value as Record<string, unknown>;
  }

  private asJson(value: unknown) {
    return value as any;
  }
}
