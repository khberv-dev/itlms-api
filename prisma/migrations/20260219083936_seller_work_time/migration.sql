-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('new', 'active');

-- AlterTable
ALTER TABLE "seller"
    ADD COLUMN "work_end_time" TEXT,
ADD COLUMN     "work_start_time" TEXT;

-- AlterTable
ALTER TABLE "user"
    ADD COLUMN "birthday" TIMESTAMP(3);
