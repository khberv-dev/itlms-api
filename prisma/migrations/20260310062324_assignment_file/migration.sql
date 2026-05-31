-- AlterTable
ALTER TABLE "file" ADD COLUMN     "assignment_id" TEXT;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
