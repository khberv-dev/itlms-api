-- AlterTable
ALTER TABLE "group_monthly_snapshot" ADD COLUMN     "expired_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "h1_expired_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "h2_expired_count" INTEGER NOT NULL DEFAULT 0;
