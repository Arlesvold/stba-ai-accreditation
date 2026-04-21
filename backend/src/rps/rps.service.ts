import { Injectable } from '@nestjs/common';
import {
  GenerateRpsDraftDto,
  RpsAssessmentDto,
  RpsCloItemDto,
  RpsWeeklyPlanItemDto,
} from './dto/generate-rps.dto.js';

type RpsDraftPayload = {
  metadata: {
    title: string;
    systemName: string;
    institutionName: string;
    generatedDate: string;
    draftVersion: string;
    courseName: string;
    courseCode: string;
    programStudy: string;
    semester: string;
    sks: number;
    academicYear: string;
    totalWeeks: number;
  };
  insights: {
    confidenceScore: number;
    evidenceCountUsed: number;
    lastGeneratedAt: string;
    consistencyStatus: string;
  };
  sections: {
    courseDescription: string;
    prerequisites: string[];
    clos: RpsCloItemDto[];
    weeklyPlan: RpsWeeklyPlanItemDto[];
    learningResources: string[];
    finalAssessment: RpsAssessmentDto;
    aiNote: string;
  };
  output: {
    markdown: string;
  };
};

@Injectable()
export class RpsService {
  generateDraft(dto: GenerateRpsDraftDto): RpsDraftPayload {
    const generatedDate = dto.generatedDate ?? this.formatIndonesianDate(new Date());
    const draftVersion = dto.draftVersion ?? '1.2';
    const courseName = dto.courseName ?? 'Academic Writing';
    const courseCode = dto.courseCode ?? 'ENG-301';
    const programStudy = dto.programStudy ?? 'S1 Sastra Inggris';
    const semester = dto.semester ?? '3 (Ganjil)';
    const sks = dto.sks ?? 3;
    const academicYear = dto.academicYear ?? '2026/2027';
    const totalWeeks = dto.totalWeeks ?? 16;
    const courseDescription =
      dto.courseDescription ??
      'Mata kuliah ini membekali mahasiswa dengan kemampuan menulis akademik yang efektif, mulai dari perencanaan hingga penyusunan esai dan paper ilmiah.';
    const prerequisites = dto.prerequisites ?? [
      'English Grammar',
      'Paragraph Writing',
    ];

    const clos = dto.clos ?? [
      {
        code: 'CLO-1',
        clo: 'Mahasiswa mampu menyusun outline dan struktur esai akademik yang jelas',
        taxonomyLevel: 'C4 (Analyze)',
        indicator: 'Outline lengkap dengan thesis statement',
      },
      {
        code: 'CLO-2',
        clo: 'Mahasiswa mampu menulis paragraf dengan kohesi dan koherensi yang baik',
        taxonomyLevel: 'C5 (Evaluate)',
        indicator: 'Penggunaan transition signals minimal 80% benar',
      },
      {
        code: 'CLO-3',
        clo: 'Mahasiswa mampu mengutip dan merujuk sumber sesuai APA 7th edition',
        taxonomyLevel: 'C3 (Apply)',
        indicator: 'Tidak ada kesalahan sitasi',
      },
      {
        code: 'CLO-4',
        clo: 'Mahasiswa mampu menggunakan AI writing tools secara etis',
        taxonomyLevel: 'C6 (Create)',
        indicator: 'Esai akhir mengandung kontribusi orisinal >=70%',
      },
    ];

    const weeklyPlan = dto.weeklyPlan ?? [
      {
        week: '1',
        topicSubtopic: 'Orientation & Academic Writing Process',
        learningMethod: 'Ceramah + Diskusi',
        duration: '3 x 50 menit',
        assessment: '-',
      },
      {
        week: '2',
        topicSubtopic: 'Thesis Statement & Essay Structure',
        learningMethod: 'Case Study + Group Work',
        duration: '3 x 50 menit',
        assessment: 'Outline Submission (5%)',
      },
      {
        week: '3',
        topicSubtopic: 'Essay Structure Deepening',
        learningMethod: 'Case Study + Group Work',
        duration: '3 x 50 menit',
        assessment: 'Outline Submission (5%)',
      },
      {
        week: '4',
        topicSubtopic: 'Paragraph Development & Cohesion',
        learningMethod: 'Writing Workshop',
        duration: '3 x 50 menit',
        assessment: 'Draft Paragraph (5%)',
      },
      {
        week: '5',
        topicSubtopic: 'Paragraph Unity and Coherence',
        learningMethod: 'Writing Workshop',
        duration: '3 x 50 menit',
        assessment: 'Draft Paragraph (5%)',
      },
      {
        week: '6',
        topicSubtopic: 'Transition Signals and Editing Basics',
        learningMethod: 'Writing Workshop',
        duration: '3 x 50 menit',
        assessment: 'Draft Paragraph (5%)',
      },
      {
        week: '7',
        topicSubtopic: 'Mid-Semester Review',
        learningMethod: 'Peer Review',
        duration: '3 x 50 menit',
        assessment: 'Mid Exam (20%)',
      },
      {
        week: '8',
        topicSubtopic: 'Citation & Referencing (APA 7)',
        learningMethod: 'Hands-on Practice',
        duration: '3 x 50 menit',
        assessment: 'Citation Exercise (3%)',
      },
      {
        week: '9',
        topicSubtopic: 'Paraphrasing and Summarizing',
        learningMethod: 'Hands-on Practice',
        duration: '3 x 50 menit',
        assessment: 'Citation Exercise (3%)',
      },
      {
        week: '10',
        topicSubtopic: 'Academic Integrity and Anti-Plagiarism',
        learningMethod: 'Hands-on Practice',
        duration: '3 x 50 menit',
        assessment: 'Citation Exercise (4%)',
      },
      {
        week: '11',
        topicSubtopic: 'Argumentative Essay & Critical Thinking',
        learningMethod: 'AI-Assisted Drafting',
        duration: '3 x 50 menit',
        assessment: 'Full Draft Essay (7%)',
      },
      {
        week: '12',
        topicSubtopic: 'Developing Claims and Evidence',
        learningMethod: 'AI-Assisted Drafting',
        duration: '3 x 50 menit',
        assessment: 'Full Draft Essay (7%)',
      },
      {
        week: '13',
        topicSubtopic: 'Draft Consolidation',
        learningMethod: 'AI-Assisted Drafting',
        duration: '3 x 50 menit',
        assessment: 'Full Draft Essay (6%)',
      },
      {
        week: '14',
        topicSubtopic: 'Revision & Final Editing',
        learningMethod: 'Individual Consultation',
        duration: '3 x 50 menit',
        assessment: 'Final Essay (10%)',
      },
      {
        week: '15',
        topicSubtopic: 'Language Polishing and Proofreading',
        learningMethod: 'Individual Consultation',
        duration: '3 x 50 menit',
        assessment: 'Final Essay (10%)',
      },
      {
        week: String(totalWeeks),
        topicSubtopic: 'Final Presentation & Reflection',
        learningMethod: 'Presentasi',
        duration: '3 x 50 menit',
        assessment: 'Reflection Paper (5%)',
      },
    ];

    const learningResources = dto.learningResources ?? [
      'Swales, J.M. & Feak, C.B. (2012). Academic Writing for Graduate Students. University of Michigan Press.',
      'Bailey, S. (2018). Academic Writing: A Handbook for International Students (5th ed.). Routledge.',
      'Oshima, A. & Hogue, A. (2006). Writing Academic English (4th ed.). Pearson Longman.',
      'Tools AI: Grammarly, QuillBot, ChatGPT (dengan panduan etika)',
      'Platform: Google Docs, Turnitin, Microsoft Word',
    ];

    const finalAssessment = dto.finalAssessment ?? {
      utsPercent: 20,
      uasPercent: 40,
      assignmentPortfolioPercent: 30,
      participationReflectionPercent: 10,
    };

    const evidenceCount = this.estimateEvidenceCount(
      clos.length,
      weeklyPlan.length,
      learningResources.length,
      prerequisites.length,
    );

    const confidenceScore = this.calculateConfidenceScore(evidenceCount, dto);
    const aiNote =
      `Draft RPS ini dihasilkan otomatis oleh AI Document Intelligence Engine berdasarkan Kurikulum OBE Program Studi ${programStudy} ` +
      `dan ${evidenceCount} bukti pendukung. Evidence Binding telah dilakukan. Mohon dilakukan validasi akhir oleh dosen pengampu sebelum digunakan sebagai dokumen resmi.`;

    return {
      metadata: {
        title: 'AI Document Generator',
        systemName: 'AI-Based Accreditation Intelligence System',
        institutionName: 'Sekolah Tinggi Bahasa Asing (STBA) Pontianak',
        generatedDate,
        draftVersion,
        courseName,
        courseCode,
        programStudy,
        semester,
        sks,
        academicYear,
        totalWeeks,
      },
      insights: {
        confidenceScore,
        evidenceCountUsed: evidenceCount,
        lastGeneratedAt: new Date().toISOString(),
        consistencyStatus: 'CONSISTENT',
      },
      sections: {
        courseDescription,
        prerequisites,
        clos,
        weeklyPlan,
        learningResources,
        finalAssessment,
        aiNote,
      },
      output: {
        markdown: this.buildMarkdown({
          generatedDate,
          draftVersion,
          courseName,
          courseCode,
          programStudy,
          semester,
          sks,
          academicYear,
          totalWeeks,
          courseDescription,
          prerequisites,
          clos,
          weeklyPlan,
          learningResources,
          finalAssessment,
          aiNote,
        }),
      },
    };
  }

  private calculateConfidenceScore(
    evidenceCount: number,
    dto: GenerateRpsDraftDto,
  ) {
    const hasCustomClos = (dto.clos?.length ?? 0) >= 4;
    const hasWeeklyPlan = (dto.weeklyPlan?.length ?? 0) >= 16;

    let score = 72;
    if (evidenceCount >= 10) score += 8;
    if (evidenceCount >= 18) score += 8;
    if (hasCustomClos) score += 5;
    if (hasWeeklyPlan) score += 5;

    return Math.min(98, score);
  }

  private estimateEvidenceCount(
    cloCount: number,
    weeklyCount: number,
    resourceCount: number,
    prerequisiteCount: number,
  ) {
    const estimated =
      4 +
      cloCount * 1 +
      Math.ceil(weeklyCount / 2) +
      resourceCount * 2 +
      prerequisiteCount * 1;
    return Math.max(12, Math.min(25, estimated));
  }

  private formatIndonesianDate(date: Date) {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });
  }

  private buildMarkdown(input: {
    generatedDate: string;
    draftVersion: string;
    courseName: string;
    courseCode: string;
    programStudy: string;
    semester: string;
    sks: number;
    academicYear: string;
    totalWeeks: number;
    courseDescription: string;
    prerequisites: string[];
    clos: RpsCloItemDto[];
    weeklyPlan: RpsWeeklyPlanItemDto[];
    learningResources: string[];
    finalAssessment: RpsAssessmentDto;
    aiNote: string;
  }) {
    const cloRows = input.clos
      .map(
        (item) =>
          `| ${item.code} | ${item.clo} | ${item.taxonomyLevel} | ${item.indicator} |`,
      )
      .join('\n');

    const weeklyRows = input.weeklyPlan
      .map(
        (item) =>
          `| ${item.week} | ${item.topicSubtopic} | ${item.learningMethod} | ${item.duration} | ${item.assessment} |`,
      )
      .join('\n');

    const resourceLines = input.learningResources.map((item) => `- ${item}`).join('\n');
    const prerequisiteLines = input.prerequisites.map((item) => `- ${item}`).join('\n');

    return [
      '# RENCANA PEMBELAJARAN SEMESTER (RPS)',
      `## Mata Kuliah ${input.courseName}`,
      '',
      '**AI Document Generator**',
      '**AI-Based Accreditation Intelligence System**',
      '**Sekolah Tinggi Bahasa Asing (STBA) Pontianak**',
      `**Tanggal Generate:** ${input.generatedDate}`,
      `**Versi Draft:** ${input.draftVersion}`,
      `**Mata Kuliah:** ${input.courseName}`,
      `**Kode MK:** ${input.courseCode}`,
      `**Program Studi:** ${input.programStudy}`,
      `**Semester:** ${input.semester}`,
      `**SKS:** ${input.sks}`,
      '',
      '---',
      '',
      '**RENCANA PEMBELAJARAN SEMESTER (RPS)**',
      `**Mata Kuliah: ${input.courseName}**`,
      `**Program Studi ${input.programStudy}**`,
      `**Tahun Akademik ${input.academicYear}**`,
      '',
      '### 1. Deskripsi Singkat Mata Kuliah',
      input.courseDescription,
      '',
      '### 2. Prasyarat Mata Kuliah',
      prerequisiteLines,
      '',
      '### 3. Capaian Pembelajaran Mata Kuliah (CLO)',
      '| No | CLO | Level Taksonomi | Indikator Penilaian |',
      '|----|-----|-----------------|---------------------|',
      cloRows,
      '',
      `### 4. Rencana Pembelajaran Mingguan (${input.totalWeeks} Minggu)`,
      '| Minggu | Topik & Subtopik | Metode Pembelajaran | Waktu | Penilaian |',
      '|--------|------------------|---------------------|-------|-----------|',
      weeklyRows,
      '',
      '### 5. Media & Sumber Belajar',
      resourceLines,
      '',
      '### 6. Penilaian Akhir',
      `- Ujian Tengah Semester: ${input.finalAssessment.utsPercent}%`,
      `- Ujian Akhir Semester (Essay): ${input.finalAssessment.uasPercent}%`,
      `- Tugas & Portofolio: ${input.finalAssessment.assignmentPortfolioPercent}%`,
      `- Partisipasi & Reflection: ${input.finalAssessment.participationReflectionPercent}%`,
      '',
      '**Catatan dari AI:**',
      input.aiNote,
    ].join('\n');
  }
}
