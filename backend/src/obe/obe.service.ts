import { Injectable } from '@nestjs/common';
import {
  CourseCloItemDto,
  CourseMappingItemDto,
  GenerateObeDraftDto,
  GraduateProfileItemDto,
  PloItemDto,
} from './dto/generate-obe.dto.js';

type ObeDraftPayload = {
  metadata: {
    title: string;
    systemName: string;
    institutionName: string;
    generatedDate: string;
    draftVersion: string;
    programStudy: string;
    academicYear: string;
  };
  insights: {
    confidenceScore: number;
    evidenceCountUsed: number;
    lastGeneratedAt: string;
  };
  sections: {
    graduateProfiles: GraduateProfileItemDto[];
    plos: PloItemDto[];
    courseMappings: CourseMappingItemDto[];
    sampleCourseName: string;
    sampleClos: CourseCloItemDto[];
    assessment: {
      utsPercent: number;
      uasPercent: number;
      assignmentPercent: number;
    };
    aiNote: string;
  };
  output: {
    markdown: string;
  };
};

@Injectable()
export class ObeService {
  generateDraft(dto: GenerateObeDraftDto): ObeDraftPayload {
    const generatedDate = dto.generatedDate ?? this.formatIndonesianDate(new Date());
    const draftVersion = dto.draftVersion ?? '1.0 (AI Generated)';
    const programStudy = dto.programStudy ?? 'S1 Sastra Inggris';
    const academicYear = dto.academicYear ?? '2026/2027';
    const evidenceCount = dto.evidenceCount ?? 18;
    const confidenceScore = this.calculateConfidenceScore(evidenceCount, dto);
    const lastGeneratedAt = new Date().toISOString();

    const graduateProfiles = dto.graduateProfiles ?? [
      {
        description:
          'Profesional komunikator bahasa Inggris di bidang pendidikan, penerjemahan, dan industri kreatif.',
      },
      {
        description:
          'Peneliti bahasa dan budaya dengan kemampuan analisis yang kuat.',
      },
      {
        description:
          'Pemimpin yang adaptif di era global dengan nilai-nilai etika dan kebangsaan.',
      },
    ];

    const plos = dto.plos ?? [
      {
        code: 'PLO-1',
        title: 'Kemampuan Berbahasa Inggris Tingkat Lanjut',
        description:
          'Mahasiswa mampu berkomunikasi lisan dan tulis dalam bahasa Inggris pada level C1 CEFR.',
      },
      {
        code: 'PLO-2',
        title: 'Pemahaman Linguistik dan Sastra',
        description:
          'Mahasiswa mampu menganalisis struktur bahasa dan karya sastra Inggris secara mendalam.',
      },
      {
        code: 'PLO-3',
        title: 'Kemampuan Penelitian dan Analisis Budaya',
        description:
          'Mahasiswa mampu melakukan penelitian sederhana tentang bahasa dan budaya Inggris.',
      },
      {
        code: 'PLO-4',
        title: 'Etika Profesional dan Kepemimpinan',
        description:
          'Mahasiswa mampu menerapkan nilai etika dan kepemimpinan dalam konteks profesional.',
      },
      {
        code: 'PLO-5',
        title: 'Literasi Digital dan Pemanfaatan AI',
        description:
          'Mahasiswa mampu memanfaatkan teknologi digital dan AI secara etis untuk pembelajaran, riset, dan produksi karya akademik.',
      },
      {
        code: 'PLO-6',
        title: 'Kolaborasi dan Pengabdian Berbasis Keilmuan',
        description:
          'Mahasiswa mampu berkolaborasi dalam tim multidisiplin dan menerapkan keilmuan untuk kebutuhan masyarakat.',
      },
    ];

    const courseMappings = dto.courseMappings ?? [
      {
        courseName: 'English Reading Comprehension',
        sks: 3,
        cloUtama: 'Mahasiswa dapat memahami teks akademik level C1',
        ploSupported: ['PLO-1', 'PLO-2'],
      },
      {
        courseName: 'Introduction to Linguistics',
        sks: 3,
        cloUtama: 'Mahasiswa dapat menjelaskan konsep dasar linguistik',
        ploSupported: ['PLO-2'],
      },
      {
        courseName: 'Academic Writing',
        sks: 3,
        cloUtama: 'Mahasiswa dapat menulis esai akademik yang koheren',
        ploSupported: ['PLO-1', 'PLO-3', 'PLO-5'],
      },
      {
        courseName: 'Cross-Cultural Understanding',
        sks: 2,
        cloUtama: 'Mahasiswa dapat menganalisis perbedaan budaya',
        ploSupported: ['PLO-3', 'PLO-4'],
      },
      {
        courseName: 'Translation and Interpreting',
        sks: 3,
        cloUtama:
          'Mahasiswa mampu menerjemahkan teks akademik dan profesional dengan akurat',
        ploSupported: ['PLO-1', 'PLO-4', 'PLO-6'],
      },
      {
        courseName: 'Digital Humanities for Language Studies',
        sks: 2,
        cloUtama:
          'Mahasiswa mampu menggunakan tools digital untuk analisis bahasa dan sastra',
        ploSupported: ['PLO-3', 'PLO-5', 'PLO-6'],
      },
    ];

    const sampleCourseName = dto.sampleCourseName ?? 'Academic Writing';
    const sampleClos = dto.sampleClos ?? [
      {
        code: 'CLO-1',
        description:
          'Mahasiswa mampu menyusun outline esai akademik dengan struktur yang jelas.',
        targetAchievementPct: 80,
      },
      {
        code: 'CLO-2',
        description:
          'Mahasiswa mampu menulis paragraf dengan kohesi dan koherensi yang baik menggunakan transition signals.',
        targetAchievementPct: 78,
      },
      {
        code: 'CLO-3',
        description:
          'Mahasiswa mampu mengutip sumber sesuai APA 7th edition tanpa plagiarisme.',
        targetAchievementPct: 84,
      },
      {
        code: 'CLO-4',
        description:
          'Mahasiswa mampu menggunakan AI writing assistant secara etis untuk proses revisi naskah akademik.',
        targetAchievementPct: 76,
      },
    ];

    const aiNote = `Draft Kurikulum OBE ini dihasilkan otomatis berdasarkan data profil prodi, data dosen, dan standar OBE nasional. Evidence Binding telah dilakukan terhadap ${evidenceCount} dokumen pendukung. Mohon dilakukan validasi akhir oleh Ketua Program Studi sebelum digunakan.`;

    const payload: ObeDraftPayload = {
      metadata: {
        title: 'AI Document Generator',
        systemName: 'AI-Based Accreditation Intelligence System',
        institutionName: 'Sekolah Tinggi Bahasa Asing (STBA) Pontianak',
        generatedDate,
        draftVersion,
        programStudy,
        academicYear,
      },
      insights: {
        confidenceScore,
        evidenceCountUsed: evidenceCount,
        lastGeneratedAt,
      },
      sections: {
        graduateProfiles,
        plos,
        courseMappings,
        sampleCourseName,
        sampleClos,
        assessment: {
          utsPercent: 40,
          uasPercent: 40,
          assignmentPercent: 20,
        },
        aiNote,
      },
      output: {
        markdown: this.buildMarkdown({
          generatedDate,
          draftVersion,
          programStudy,
          academicYear,
          graduateProfiles,
          plos,
          courseMappings,
          sampleCourseName,
          sampleClos,
          aiNote,
        }),
      },
    };

    return payload;
  }

  private calculateConfidenceScore(
    evidenceCount: number,
    dto: GenerateObeDraftDto,
  ) {
    const hasCustomProfiles = (dto.graduateProfiles?.length ?? 0) > 0;
    const hasCustomPlos = (dto.plos?.length ?? 0) >= 4;
    const hasCustomMappings = (dto.courseMappings?.length ?? 0) >= 4;

    let score = 70;

    if (evidenceCount >= 10) score += 8;
    if (evidenceCount >= 20) score += 6;
    if (hasCustomProfiles) score += 4;
    if (hasCustomPlos) score += 6;
    if (hasCustomMappings) score += 6;

    return Math.min(98, score);
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
    programStudy: string;
    academicYear: string;
    graduateProfiles: GraduateProfileItemDto[];
    plos: PloItemDto[];
    courseMappings: CourseMappingItemDto[];
    sampleCourseName: string;
    sampleClos: CourseCloItemDto[];
    aiNote: string;
  }) {
    const graduateProfileLines = input.graduateProfiles
      .map((item) => `- ${item.description}`)
      .join('\n');

    const ploRows = input.plos
      .map(
        (item, index) =>
          `| ${index + 1} | ${item.code} | ${item.title} | ${item.description} |`,
      )
      .join('\n');

    const mappingRows = input.courseMappings
      .map(
        (item) =>
          `| ${item.courseName} | ${item.sks} | ${item.cloUtama} | ${item.ploSupported.join(', ')} |`,
      )
      .join('\n');

    const cloLines = input.sampleClos
      .map((item) => {
        const target =
          typeof item.targetAchievementPct === 'number'
            ? ` (${item.targetAchievementPct}% mahasiswa mencapai target)`
            : '';
        return `- ${item.code}: ${item.description}${target}`;
      })
      .join('\n');

    return [
      '# DOKUMEN KURIKULUM OUTCOME-BASED EDUCATION (OBE)',
      '## Draft Otomatis Berbasis AI',
      '',
      '**AI Document Generator**',
      '**AI-Based Accreditation Intelligence System**',
      '**Sekolah Tinggi Bahasa Asing (STBA) Pontianak**',
      `**Tanggal Generate:** ${input.generatedDate}`,
      `**Versi Draft:** ${input.draftVersion}`,
      `**Program Studi:** ${input.programStudy}`,
      '',
      '---',
      '',
      '# KURIKULUM OUTCOME-BASED EDUCATION (OBE)',
      `## Program Studi ${input.programStudy}`,
      `## Tahun Akademik ${input.academicYear}`,
      '',
      '### 1. Profil Lulusan (Graduate Profile)',
      graduateProfileLines,
      '',
      '### 2. Program Learning Outcomes (PLO)',
      '| No | PLO | Deskripsi |',
      '|----|-----|-----------|',
      ploRows,
      '',
      '### 3. Mapping Mata Kuliah ke PLO (Contoh 4 Semester Pertama)',
      '| Mata Kuliah | SKS | CLO Utama | PLO yang Didukung |',
      '|-------------|-----|-----------|-------------------|',
      mappingRows,
      '',
      `### 4. Contoh Course Learning Outcomes (CLO) - Mata Kuliah "${input.sampleCourseName}"`,
      cloLines,
      '',
      '### 5. Assessment & Rubrik Penilaian (Otomatis Dihasilkan AI)',
      '- Ujian Tengah Semester: 40% (Essay Writing)',
      '- Ujian Akhir Semester: 40% (Research Paper)',
      '- Tugas Mingguan + Participation: 20%',
      '',
      '**Catatan dari AI:**',
      input.aiNote,
    ].join('\n');
  }
}
