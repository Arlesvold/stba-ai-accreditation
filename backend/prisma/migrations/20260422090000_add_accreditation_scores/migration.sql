-- CreateTable
CREATE TABLE "accreditation_scores" (
    "id" UUID NOT NULL,
    "criteria_no" INTEGER NOT NULL,
    "criteria_name" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "max_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "year" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accreditation_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accreditation_scores_year_idx" ON "accreditation_scores"("year");

-- CreateIndex
CREATE UNIQUE INDEX "accreditation_scores_year_criteria_no_key" ON "accreditation_scores"("year", "criteria_no");
