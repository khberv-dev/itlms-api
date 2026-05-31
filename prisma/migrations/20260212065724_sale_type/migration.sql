-- CreateEnum
CREATE TYPE "SaleType" AS ENUM ('new', 'resale');

-- CreateEnum
CREATE TYPE "SellerLevel" AS ENUM ('junior', 'middle', 'senior');

-- AlterTable
ALTER TABLE "sale"
    ADD COLUMN "type" "SaleType" NOT NULL DEFAULT 'new';

-- AlterTable
ALTER TABLE "seller"
    ADD COLUMN "level" "SellerLevel" NOT NULL DEFAULT 'junior';
