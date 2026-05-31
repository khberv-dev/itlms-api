/*
  Warnings:

  - You are about to drop the column `unfreeze_comment` on the `student_frozen` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "group_monthly_snapshot" ADD COLUMN     "h1_mentor_churn_rate" DOUBLE PRECISION,
ADD COLUMN     "h1_mentor_churned_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "h2_mentor_churn_rate" DOUBLE PRECISION,
ADD COLUMN     "h2_mentor_churned_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mentor_churn_rate" DOUBLE PRECISION,
ADD COLUMN     "mentor_churned_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "student_frozen" DROP COLUMN "unfreeze_comment",
ALTER COLUMN "start_date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "start_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "end_date" SET DATA TYPE TIMESTAMP(3);
