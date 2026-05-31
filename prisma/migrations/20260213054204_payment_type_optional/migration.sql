-- AlterEnum
ALTER TYPE "SaleSource" ADD VALUE 'other';

-- AlterTable
ALTER TABLE "sale" ALTER COLUMN "payment_type" DROP NOT NULL;
