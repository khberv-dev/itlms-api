/*
  Warnings:

  - You are about to drop the column `change_reason` on the `student_status` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student_status" DROP COLUMN "change_reason",
ADD COLUMN     "comment" TEXT;

-- DropEnum
DROP TYPE "StatusChangeReason";
