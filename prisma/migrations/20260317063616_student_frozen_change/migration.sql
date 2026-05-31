-- AlterEnum
ALTER TYPE "StatusChangeReason" ADD VALUE 'activated';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StudentStatus" ADD VALUE 'frozen';
ALTER TYPE "StudentStatus" ADD VALUE 'dropped';

-- AlterTable
ALTER TABLE "student_frozen"
    ADD COLUMN "unfreeze_comment" TEXT,
ADD COLUMN     "unfrozen_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "student_frozen_end_date_idx" ON "student_frozen" ("end_date");
