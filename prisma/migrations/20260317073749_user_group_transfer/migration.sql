-- CreateEnum
CREATE TYPE "TransferReason" AS ENUM ('mentor_issue', 'schedule_conflict', 'level_change', 'personal', 'other');

-- AlterTable
ALTER TABLE "group_student"
    ADD COLUMN "affects_mentor_retention" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "previous_group_student_id" TEXT,
ADD COLUMN     "transfer_comment" TEXT,
ADD COLUMN     "transfer_created_by_id" TEXT,
ADD COLUMN     "transfer_reason" "TransferReason";

-- AddForeignKey
ALTER TABLE "group_student"
    ADD CONSTRAINT "group_student_transfer_created_by_id_fkey" FOREIGN KEY ("transfer_created_by_id") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_student"
    ADD CONSTRAINT "group_student_previous_group_student_id_fkey" FOREIGN KEY ("previous_group_student_id") REFERENCES "group_student" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
