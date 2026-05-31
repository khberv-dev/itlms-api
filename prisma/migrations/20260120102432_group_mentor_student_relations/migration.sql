-- AlterTable
ALTER TABLE "group" ADD COLUMN     "assistant_id" TEXT,
ADD COLUMN     "mentor_id" TEXT;

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "group_id" TEXT;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "mentor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
