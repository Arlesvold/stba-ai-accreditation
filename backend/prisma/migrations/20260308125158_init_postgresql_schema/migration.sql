-- CreateTable
CREATE TABLE "institutions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "institution_type" TEXT,
    "status" TEXT,
    "city" TEXT,
    "province" TEXT,
    "address" TEXT,
    "website" TEXT,
    "email" TEXT,
    "focus_area" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_programs" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degree_level" TEXT,
    "accreditation_status" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "year_label" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_units" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit_type" TEXT,
    "parent_unit_id" UUID,

    CONSTRAINT "organization_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduate_profiles" (
    "id" UUID NOT NULL,
    "study_program_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stakeholder_source" TEXT,
    "version_no" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "graduate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpl" (
    "id" UUID NOT NULL,
    "study_program_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "domain_type" TEXT,
    "description" TEXT NOT NULL,
    "level" TEXT,
    "version_no" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cpl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "study_program_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "semester_recommended" INTEGER,
    "course_type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_prerequisites" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "prerequisite_course_id" UUID NOT NULL,

    CONSTRAINT "course_prerequisites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpl_course_map" (
    "id" UUID NOT NULL,
    "cpl_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "contribution_level" TEXT,

    CONSTRAINT "cpl_course_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_structures" (
    "id" UUID NOT NULL,
    "study_program_id" UUID NOT NULL,
    "version_no" INTEGER NOT NULL,
    "curriculum_name" TEXT NOT NULL,
    "effective_year" INTEGER NOT NULL,
    "total_credits" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "curriculum_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_semester_plans" (
    "id" UUID NOT NULL,
    "curriculum_structure_id" UUID NOT NULL,
    "semester_no" INTEGER NOT NULL,
    "course_id" UUID NOT NULL,
    "credits" INTEGER NOT NULL,

    CONSTRAINT "curriculum_semester_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_reviews" (
    "id" UUID NOT NULL,
    "study_program_id" UUID NOT NULL,
    "review_year" INTEGER NOT NULL,
    "stakeholder_feedback" JSONB,
    "changes_summary" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "curriculum_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_identities" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "study_program_id" UUID,
    "coordinator_name" TEXT,
    "semester_offered" TEXT,
    "language" TEXT,
    "version_no" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "course_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpmk" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "cpmk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_cpmk" (
    "id" UUID NOT NULL,
    "cpmk_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "sub_cpmk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpmk_cpl_map" (
    "id" UUID NOT NULL,
    "cpmk_id" UUID NOT NULL,
    "cpl_id" UUID NOT NULL,

    CONSTRAINT "cpmk_cpl_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_plans" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "week_no" INTEGER NOT NULL,
    "sub_cpmk_id" UUID,
    "topic" TEXT NOT NULL,
    "learning_method" TEXT,
    "student_activity" TEXT,
    "assessment_method" TEXT,
    "indicator" TEXT,
    "notes" TEXT,

    CONSTRAINT "weekly_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_components" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "component_name" TEXT NOT NULL,
    "weight_pct" DOUBLE PRECISION NOT NULL,
    "remedial_policy" TEXT,

    CONSTRAINT "grading_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rps_documents" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "document_output_id" UUID,
    "version_no" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "generated_from_template_id" UUID,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "rps_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vmts" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "study_program_id" UUID,
    "vision" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "goals" TEXT,
    "strategies" TEXT,
    "version_no" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "vmts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students_summary" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "study_program_id" UUID,
    "academic_year_id" UUID NOT NULL,
    "applicants_total" INTEGER NOT NULL DEFAULT 0,
    "new_students_total" INTEGER NOT NULL DEFAULT 0,
    "active_students_total" INTEGER NOT NULL DEFAULT 0,
    "dropout_rate_pct" DOUBLE PRECISION,
    "student_achievements_total" INTEGER NOT NULL DEFAULT 0,
    "mbkm_students_total" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "students_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduates_outcomes" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "study_program_id" UUID,
    "academic_year_id" UUID NOT NULL,
    "avg_gpa" DOUBLE PRECISION,
    "avg_study_period_years" DOUBLE PRECISION,
    "employment_wait_months" DOUBLE PRECISION,
    "field_alignment_pct" DOUBLE PRECISION,
    "continuing_study_pct" DOUBLE PRECISION,

    CONSTRAINT "graduates_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturers_summary" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "study_program_id" UUID,
    "academic_year_id" UUID NOT NULL,
    "permanent_count" INTEGER NOT NULL DEFAULT 0,
    "non_permanent_count" INTEGER NOT NULL DEFAULT 0,
    "masters_count" INTEGER NOT NULL DEFAULT 0,
    "doctoral_count" INTEGER NOT NULL DEFAULT 0,
    "professor_count" INTEGER NOT NULL DEFAULT 0,
    "associate_professor_count" INTEGER NOT NULL DEFAULT 0,
    "lecturer_certified_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lecturers_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_summary" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "study_program_id" UUID,
    "academic_year_id" UUID NOT NULL,
    "obe_implemented_pct" DOUBLE PRECISION,
    "rps_complete_pct" DOUBLE PRECISION,
    "mbkm_courses_pct" DOUBLE PRECISION,
    "evaluation_notes" JSONB,

    CONSTRAINT "education_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_summary" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "study_program_id" UUID,
    "academic_year_id" UUID NOT NULL,
    "grants_total" INTEGER NOT NULL DEFAULT 0,
    "publications_total" INTEGER NOT NULL DEFAULT 0,
    "scopus_total" INTEGER NOT NULL DEFAULT 0,
    "ipr_total" INTEGER NOT NULL DEFAULT 0,
    "citation_total" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "research_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_summary" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "study_program_id" UUID,
    "academic_year_id" UUID NOT NULL,
    "programs_total" INTEGER NOT NULL DEFAULT 0,
    "partners_total" INTEGER NOT NULL DEFAULT 0,
    "outputs_total" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_summary" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "operational_budget" DOUBLE PRECISION,
    "research_budget" DOUBLE PRECISION,
    "service_budget" DOUBLE PRECISION,
    "scholarship_budget" DOUBLE PRECISION,

    CONSTRAINT "finance_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities_summary" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "study_program_id" UUID,
    "academic_year_id" UUID NOT NULL,
    "classrooms_total" INTEGER NOT NULL DEFAULT 0,
    "labs_total" INTEGER NOT NULL DEFAULT 0,
    "library_collections_total" INTEGER NOT NULL DEFAULT 0,
    "lms_available" BOOLEAN NOT NULL DEFAULT false,
    "internet_coverage_pct" DOUBLE PRECISION,

    CONSTRAINT "facilities_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iku_values" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "study_program_id" UUID,
    "academic_year_id" UUID NOT NULL,
    "iku_code" TEXT NOT NULL,
    "value_numeric" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "source_unit_id" UUID,
    "validation_status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "iku_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_documents" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "study_program_id" UUID,
    "owner_unit_id" UUID,
    "evidence_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "document_type" TEXT,
    "issue_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "file_key" TEXT,
    "file_name" TEXT,
    "mime_type" TEXT,
    "checksum" TEXT,
    "size_bytes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "uploaded_at" TIMESTAMP(3),

    CONSTRAINT "evidence_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_tags" (
    "id" UUID NOT NULL,
    "evidence_document_id" UUID NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "evidence_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_mappings" (
    "id" UUID NOT NULL,
    "evidence_document_id" UUID NOT NULL,
    "document_definition_id" UUID,
    "document_section_id" UUID,
    "criterion_code" TEXT,
    "mapping_note" TEXT,

    CONSTRAINT "evidence_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_validations" (
    "id" UUID NOT NULL,
    "evidence_document_id" UUID NOT NULL,
    "validation_result" TEXT NOT NULL,
    "validation_note" TEXT,
    "validated_by" TEXT,
    "validated_at" TIMESTAMP(3),

    CONSTRAINT "evidence_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_definitions" (
    "id" UUID NOT NULL,
    "document_code" TEXT NOT NULL,
    "document_name" TEXT NOT NULL,
    "level" TEXT,
    "category" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "output_format_default" TEXT,
    "owner_unit_id" UUID,
    "description" TEXT,

    CONSTRAINT "document_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_sections" (
    "id" UUID NOT NULL,
    "document_definition_id" UUID NOT NULL,
    "section_code" TEXT NOT NULL,
    "section_name" TEXT NOT NULL,
    "section_order" INTEGER NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "prompt_policy_key" TEXT,
    "template_block_key" TEXT,

    CONSTRAINT "document_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_requirements" (
    "id" UUID NOT NULL,
    "document_definition_id" UUID NOT NULL,
    "entity_name" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "validation_rule" TEXT,
    "notes" TEXT,

    CONSTRAINT "document_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_templates" (
    "id" UUID NOT NULL,
    "document_definition_id" UUID NOT NULL,
    "template_name" TEXT NOT NULL,
    "template_format" TEXT NOT NULL,
    "file_key" TEXT,
    "version_no" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_generation_jobs" (
    "id" UUID NOT NULL,
    "document_definition_id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "study_program_id" UUID,
    "academic_year_id" UUID,
    "requested_by" TEXT NOT NULL,
    "job_status" TEXT NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "input_snapshot" JSONB,
    "notes" TEXT,

    CONSTRAINT "document_generation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_outputs" (
    "id" UUID NOT NULL,
    "document_generation_job_id" UUID NOT NULL,
    "document_definition_id" UUID NOT NULL,
    "version_no" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "docx_file_key" TEXT,
    "pdf_file_key" TEXT,
    "xlsx_file_key" TEXT,
    "generated_at" TIMESTAMP(3),

    CONSTRAINT "document_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_section_outputs" (
    "id" UUID NOT NULL,
    "document_output_id" UUID NOT NULL,
    "document_section_id" UUID NOT NULL,
    "section_text" TEXT NOT NULL,
    "source_snapshot" JSONB,
    "generation_meta" JSONB,

    CONSTRAINT "document_section_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_comments" (
    "id" UUID NOT NULL,
    "document_output_id" UUID NOT NULL,
    "document_section_id" UUID,
    "comment_type" TEXT,
    "comment_text" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" UUID NOT NULL,
    "document_output_id" UUID NOT NULL,
    "approval_stage" TEXT NOT NULL,
    "approver_id" TEXT NOT NULL,
    "approval_status" TEXT NOT NULL,
    "approval_note" TEXT,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_results" (
    "id" UUID NOT NULL,
    "document_output_id" UUID NOT NULL,
    "validation_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "rule_code" TEXT,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_logs" (
    "id" UUID NOT NULL,
    "entity_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "change_type" TEXT NOT NULL,
    "before_data" JSONB,
    "after_data" JSONB,
    "changed_by" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "institution_id" UUID,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "role_code" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_registry" (
    "id" UUID NOT NULL,
    "tool_code" TEXT NOT NULL,
    "tool_name" TEXT NOT NULL,
    "input_schema" JSONB,
    "output_schema" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tool_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_execution_logs" (
    "id" UUID NOT NULL,
    "tool_registry_id" UUID NOT NULL,
    "document_generation_job_id" UUID,
    "input_payload" JSONB,
    "output_payload" JSONB,
    "execution_status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "tool_execution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutions_code_key" ON "institutions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "study_programs_institution_id_code_key" ON "study_programs"("institution_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_institution_id_year_label_key" ON "academic_years"("institution_id", "year_label");

-- CreateIndex
CREATE UNIQUE INDEX "organization_units_institution_id_code_key" ON "organization_units"("institution_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "cpl_study_program_id_code_key" ON "cpl"("study_program_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "courses_study_program_id_code_key" ON "courses"("study_program_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "course_prerequisites_course_id_prerequisite_course_id_key" ON "course_prerequisites"("course_id", "prerequisite_course_id");

-- CreateIndex
CREATE UNIQUE INDEX "cpl_course_map_cpl_id_course_id_key" ON "cpl_course_map"("cpl_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_identities_course_id_key" ON "course_identities"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "cpmk_course_id_code_key" ON "cpmk"("course_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "cpmk_cpl_map_cpmk_id_cpl_id_key" ON "cpmk_cpl_map"("cpmk_id", "cpl_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_definitions_document_code_key" ON "document_definitions"("document_code");

-- CreateIndex
CREATE UNIQUE INDEX "document_sections_document_definition_id_section_code_key" ON "document_sections"("document_definition_id", "section_code");

-- CreateIndex
CREATE INDEX "change_logs_entity_name_record_id_idx" ON "change_logs"("entity_name", "record_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_code_key" ON "roles"("role_code");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "tool_registry_tool_code_key" ON "tool_registry"("tool_code");

-- AddForeignKey
ALTER TABLE "study_programs" ADD CONSTRAINT "study_programs_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_units" ADD CONSTRAINT "organization_units_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_units" ADD CONSTRAINT "organization_units_parent_unit_id_fkey" FOREIGN KEY ("parent_unit_id") REFERENCES "organization_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduate_profiles" ADD CONSTRAINT "graduate_profiles_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpl" ADD CONSTRAINT "cpl_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_prerequisites" ADD CONSTRAINT "course_prerequisites_prerequisite_course_id_fkey" FOREIGN KEY ("prerequisite_course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpl_course_map" ADD CONSTRAINT "cpl_course_map_cpl_id_fkey" FOREIGN KEY ("cpl_id") REFERENCES "cpl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpl_course_map" ADD CONSTRAINT "cpl_course_map_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_structures" ADD CONSTRAINT "curriculum_structures_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_semester_plans" ADD CONSTRAINT "curriculum_semester_plans_curriculum_structure_id_fkey" FOREIGN KEY ("curriculum_structure_id") REFERENCES "curriculum_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_semester_plans" ADD CONSTRAINT "curriculum_semester_plans_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_reviews" ADD CONSTRAINT "curriculum_reviews_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_identities" ADD CONSTRAINT "course_identities_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpmk" ADD CONSTRAINT "cpmk_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_cpmk" ADD CONSTRAINT "sub_cpmk_cpmk_id_fkey" FOREIGN KEY ("cpmk_id") REFERENCES "cpmk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpmk_cpl_map" ADD CONSTRAINT "cpmk_cpl_map_cpmk_id_fkey" FOREIGN KEY ("cpmk_id") REFERENCES "cpmk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpmk_cpl_map" ADD CONSTRAINT "cpmk_cpl_map_cpl_id_fkey" FOREIGN KEY ("cpl_id") REFERENCES "cpl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_plans" ADD CONSTRAINT "weekly_plans_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_plans" ADD CONSTRAINT "weekly_plans_sub_cpmk_id_fkey" FOREIGN KEY ("sub_cpmk_id") REFERENCES "sub_cpmk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_components" ADD CONSTRAINT "grading_components_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rps_documents" ADD CONSTRAINT "rps_documents_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rps_documents" ADD CONSTRAINT "rps_documents_document_output_id_fkey" FOREIGN KEY ("document_output_id") REFERENCES "document_outputs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rps_documents" ADD CONSTRAINT "rps_documents_generated_from_template_id_fkey" FOREIGN KEY ("generated_from_template_id") REFERENCES "document_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vmts" ADD CONSTRAINT "vmts_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vmts" ADD CONSTRAINT "vmts_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students_summary" ADD CONSTRAINT "students_summary_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students_summary" ADD CONSTRAINT "students_summary_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students_summary" ADD CONSTRAINT "students_summary_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduates_outcomes" ADD CONSTRAINT "graduates_outcomes_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduates_outcomes" ADD CONSTRAINT "graduates_outcomes_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduates_outcomes" ADD CONSTRAINT "graduates_outcomes_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturers_summary" ADD CONSTRAINT "lecturers_summary_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturers_summary" ADD CONSTRAINT "lecturers_summary_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturers_summary" ADD CONSTRAINT "lecturers_summary_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_summary" ADD CONSTRAINT "education_summary_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_summary" ADD CONSTRAINT "education_summary_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_summary" ADD CONSTRAINT "education_summary_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_summary" ADD CONSTRAINT "research_summary_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_summary" ADD CONSTRAINT "research_summary_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_summary" ADD CONSTRAINT "research_summary_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_summary" ADD CONSTRAINT "service_summary_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_summary" ADD CONSTRAINT "service_summary_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_summary" ADD CONSTRAINT "service_summary_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_summary" ADD CONSTRAINT "finance_summary_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_summary" ADD CONSTRAINT "finance_summary_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities_summary" ADD CONSTRAINT "facilities_summary_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities_summary" ADD CONSTRAINT "facilities_summary_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities_summary" ADD CONSTRAINT "facilities_summary_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iku_values" ADD CONSTRAINT "iku_values_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iku_values" ADD CONSTRAINT "iku_values_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iku_values" ADD CONSTRAINT "iku_values_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iku_values" ADD CONSTRAINT "iku_values_source_unit_id_fkey" FOREIGN KEY ("source_unit_id") REFERENCES "organization_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_documents" ADD CONSTRAINT "evidence_documents_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_documents" ADD CONSTRAINT "evidence_documents_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_documents" ADD CONSTRAINT "evidence_documents_owner_unit_id_fkey" FOREIGN KEY ("owner_unit_id") REFERENCES "organization_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_tags" ADD CONSTRAINT "evidence_tags_evidence_document_id_fkey" FOREIGN KEY ("evidence_document_id") REFERENCES "evidence_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_mappings" ADD CONSTRAINT "evidence_mappings_evidence_document_id_fkey" FOREIGN KEY ("evidence_document_id") REFERENCES "evidence_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_mappings" ADD CONSTRAINT "evidence_mappings_document_definition_id_fkey" FOREIGN KEY ("document_definition_id") REFERENCES "document_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_mappings" ADD CONSTRAINT "evidence_mappings_document_section_id_fkey" FOREIGN KEY ("document_section_id") REFERENCES "document_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_validations" ADD CONSTRAINT "evidence_validations_evidence_document_id_fkey" FOREIGN KEY ("evidence_document_id") REFERENCES "evidence_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_definitions" ADD CONSTRAINT "document_definitions_owner_unit_id_fkey" FOREIGN KEY ("owner_unit_id") REFERENCES "organization_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_sections" ADD CONSTRAINT "document_sections_document_definition_id_fkey" FOREIGN KEY ("document_definition_id") REFERENCES "document_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requirements" ADD CONSTRAINT "document_requirements_document_definition_id_fkey" FOREIGN KEY ("document_definition_id") REFERENCES "document_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_document_definition_id_fkey" FOREIGN KEY ("document_definition_id") REFERENCES "document_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_generation_jobs" ADD CONSTRAINT "document_generation_jobs_document_definition_id_fkey" FOREIGN KEY ("document_definition_id") REFERENCES "document_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_generation_jobs" ADD CONSTRAINT "document_generation_jobs_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_generation_jobs" ADD CONSTRAINT "document_generation_jobs_study_program_id_fkey" FOREIGN KEY ("study_program_id") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_generation_jobs" ADD CONSTRAINT "document_generation_jobs_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_outputs" ADD CONSTRAINT "document_outputs_document_generation_job_id_fkey" FOREIGN KEY ("document_generation_job_id") REFERENCES "document_generation_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_outputs" ADD CONSTRAINT "document_outputs_document_definition_id_fkey" FOREIGN KEY ("document_definition_id") REFERENCES "document_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_section_outputs" ADD CONSTRAINT "document_section_outputs_document_output_id_fkey" FOREIGN KEY ("document_output_id") REFERENCES "document_outputs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_section_outputs" ADD CONSTRAINT "document_section_outputs_document_section_id_fkey" FOREIGN KEY ("document_section_id") REFERENCES "document_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_document_output_id_fkey" FOREIGN KEY ("document_output_id") REFERENCES "document_outputs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_document_section_id_fkey" FOREIGN KEY ("document_section_id") REFERENCES "document_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_document_output_id_fkey" FOREIGN KEY ("document_output_id") REFERENCES "document_outputs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_results" ADD CONSTRAINT "validation_results_document_output_id_fkey" FOREIGN KEY ("document_output_id") REFERENCES "document_outputs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_execution_logs" ADD CONSTRAINT "tool_execution_logs_tool_registry_id_fkey" FOREIGN KEY ("tool_registry_id") REFERENCES "tool_registry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_execution_logs" ADD CONSTRAINT "tool_execution_logs_document_generation_job_id_fkey" FOREIGN KEY ("document_generation_job_id") REFERENCES "document_generation_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
