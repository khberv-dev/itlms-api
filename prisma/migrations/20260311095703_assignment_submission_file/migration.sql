-- AlterTable
ALTER TABLE "file" ADD COLUMN     "assignment_submission_id" TEXT;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_assignment_submission_id_fkey" FOREIGN KEY ("assignment_submission_id") REFERENCES "assignment_submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
