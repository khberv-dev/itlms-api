-- AlterEnum
ALTER TYPE "StudentStatus" ADD VALUE 'expired';

-- AlterTable
ALTER TABLE "student"
    ADD COLUMN "status" "StudentStatus" DEFAULT 'new';
