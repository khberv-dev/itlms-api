-- CreateEnum
CREATE TYPE "DroppedReason" AS ENUM ('course_quality', 'financial', 'no_time', 'switched_course', 'mentor_dislike', 'other');

-- CreateEnum
CREATE TYPE "FrozenReason" AS ENUM ('financial', 'busy', 'health', 'course_dislike', 'other');

-- CreateEnum
CREATE TYPE "StatusChangeReason" AS ENUM ('payment_expired', 'manual_drop', 'frozen_by_admin', 'reactivated', 'transferred', 'other');

-- CreateTable
CREATE TABLE "student_dropped"
(
    "id"            TEXT            NOT NULL,
    "dropped_at"    TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason"        "DroppedReason" NOT NULL,
    "comment"       TEXT,
    "created_by_id" TEXT,
    "student_id"    TEXT            NOT NULL,
    "group_id"      TEXT,
    "mentor_id"     TEXT,
    "assistant_id"  TEXT,

    CONSTRAINT "student_dropped_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_frozen"
(
    "id"                TEXT           NOT NULL,
    "start_date"        DATE           NOT NULL,
    "end_date"          DATE           NOT NULL,
    "reason"            "FrozenReason" NOT NULL,
    "affects_retention" BOOLEAN        NOT NULL DEFAULT false,
    "comment"           TEXT,
    "created_at"        TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id"     TEXT,
    "student_id"        TEXT           NOT NULL,
    "group_id"          TEXT,
    "mentor_id"         TEXT,
    "assistant_id"      TEXT,

    CONSTRAINT "student_frozen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_status"
(
    "id"                TEXT            NOT NULL,
    "from_status"       "StudentStatus",
    "to_status"         "StudentStatus" NOT NULL,
    "changed_at"        TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "affects_retention" BOOLEAN         NOT NULL DEFAULT false,
    "change_reason"     "StatusChangeReason",
    "changed_by_id"     TEXT,
    "student_id"        TEXT            NOT NULL,
    "group_id"          TEXT,
    "mentor_id"         TEXT,
    "assistant_id"      TEXT,

    CONSTRAINT "student_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_monthly_snapshot"
(
    "id"                       TEXT         NOT NULL,
    "year"                     INTEGER      NOT NULL,
    "month"                    INTEGER      NOT NULL,
    "active_count_start"       INTEGER      NOT NULL DEFAULT 0,
    "active_count_end"         INTEGER      NOT NULL DEFAULT 0,
    "joined_count"             INTEGER      NOT NULL DEFAULT 0,
    "churned_count"            INTEGER      NOT NULL DEFAULT 0,
    "transferred_out_count"    INTEGER      NOT NULL DEFAULT 0,
    "transferred_in_count"     INTEGER      NOT NULL DEFAULT 0,
    "company_churned_count"    INTEGER      NOT NULL DEFAULT 0,
    "retention_rate"           DOUBLE PRECISION,
    "churn_rate"               DOUBLE PRECISION,
    "company_churn_rate"       DOUBLE PRECISION,
    "ltv"                      DECIMAL(18, 2),
    "h1_active_count_start"    INTEGER      NOT NULL DEFAULT 0,
    "h1_active_count_end"      INTEGER      NOT NULL DEFAULT 0,
    "h1_joined_count"          INTEGER      NOT NULL DEFAULT 0,
    "h1_churned_count"         INTEGER      NOT NULL DEFAULT 0,
    "h1_transferred_out_count" INTEGER      NOT NULL DEFAULT 0,
    "h1_transferred_in_count"  INTEGER      NOT NULL DEFAULT 0,
    "h1_company_churned_count" INTEGER      NOT NULL DEFAULT 0,
    "h1_retention_rate"        DOUBLE PRECISION,
    "h1_churn_rate"            DOUBLE PRECISION,
    "h1_company_churn_rate"    DOUBLE PRECISION,
    "h1_ltv"                   DECIMAL(18, 2),
    "h1_calculated_at"         TIMESTAMP(3),
    "h2_active_count_start"    INTEGER      NOT NULL DEFAULT 0,
    "h2_active_count_end"      INTEGER      NOT NULL DEFAULT 0,
    "h2_joined_count"          INTEGER      NOT NULL DEFAULT 0,
    "h2_churned_count"         INTEGER      NOT NULL DEFAULT 0,
    "h2_transferred_out_count" INTEGER      NOT NULL DEFAULT 0,
    "h2_transferred_in_count"  INTEGER      NOT NULL DEFAULT 0,
    "h2_company_churned_count" INTEGER      NOT NULL DEFAULT 0,
    "h2_retention_rate"        DOUBLE PRECISION,
    "h2_churn_rate"            DOUBLE PRECISION,
    "h2_company_churn_rate"    DOUBLE PRECISION,
    "h2_ltv"                   DECIMAL(18, 2),
    "h2_calculated_at"         TIMESTAMP(3),
    "group_id"                 TEXT         NOT NULL,
    "mentor_id"                TEXT,
    "assistant_id"             TEXT,
    "calculated_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_monthly_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_dropped_student_id_idx" ON "student_dropped" ("student_id");

-- CreateIndex
CREATE INDEX "student_dropped_group_id_dropped_at_idx" ON "student_dropped" ("group_id", "dropped_at");

-- CreateIndex
CREATE INDEX "student_frozen_student_id_start_date_idx" ON "student_frozen" ("student_id", "start_date");

-- CreateIndex
CREATE INDEX "student_status_student_id_changed_at_idx" ON "student_status" ("student_id", "changed_at");

-- CreateIndex
CREATE INDEX "group_monthly_snapshot_mentor_id_year_month_idx" ON "group_monthly_snapshot" ("mentor_id", "year", "month");

-- CreateIndex
CREATE INDEX "group_monthly_snapshot_year_month_idx" ON "group_monthly_snapshot" ("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "group_monthly_snapshot_group_id_year_month_key" ON "group_monthly_snapshot" ("group_id", "year", "month");

-- AddForeignKey
ALTER TABLE "student_dropped"
    ADD CONSTRAINT "student_dropped_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_dropped"
    ADD CONSTRAINT "student_dropped_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_dropped"
    ADD CONSTRAINT "student_dropped_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_dropped"
    ADD CONSTRAINT "student_dropped_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_dropped"
    ADD CONSTRAINT "student_dropped_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "mentor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_frozen"
    ADD CONSTRAINT "student_frozen_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_frozen"
    ADD CONSTRAINT "student_frozen_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_frozen"
    ADD CONSTRAINT "student_frozen_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_frozen"
    ADD CONSTRAINT "student_frozen_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_frozen"
    ADD CONSTRAINT "student_frozen_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "mentor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_status"
    ADD CONSTRAINT "student_status_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_status"
    ADD CONSTRAINT "student_status_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_status"
    ADD CONSTRAINT "student_status_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_status"
    ADD CONSTRAINT "student_status_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_status"
    ADD CONSTRAINT "student_status_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "mentor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_monthly_snapshot"
    ADD CONSTRAINT "group_monthly_snapshot_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_monthly_snapshot"
    ADD CONSTRAINT "group_monthly_snapshot_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_monthly_snapshot"
    ADD CONSTRAINT "group_monthly_snapshot_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "mentor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
