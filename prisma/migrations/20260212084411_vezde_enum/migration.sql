/*
  Warnings:

  - The `source` column on the `sale` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `address` column on the `student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `job` column on the `student` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('installment', 'full');

-- CreateEnum
CREATE TYPE "SaleSource" AS ENUM ('meta', 'direct', 'telegram', 'youtube', 'website', 'referal');

-- CreateEnum
CREATE TYPE "StudentAddress" AS ENUM ('toshkent', 'toshkent_vil', 'samarqand', 'buxoro', 'xorazm', 'fargona', 'andijon', 'namangan', 'qashqadaryo', 'jizzax', 'sirdaryo', 'navoiy', 'surxandaryo', 'qoraqalpogiston', 'other');

-- CreateEnum
CREATE TYPE "StudentJob" AS ENUM ('pupil', 'student', 'teacher', 'preschool_education', 'state_job', 'entrepreneur', 'financial_sector', 'housewife', 'medical_staff', 'military', 'law_field', 'other');

-- AlterTable
ALTER TABLE "sale"
    ADD COLUMN "payment_type" "PaymentType" NOT NULL DEFAULT 'full',
DROP
COLUMN "source",
ADD COLUMN     "source" "SaleSource";

-- AlterTable
ALTER TABLE "student" DROP COLUMN "address",
ADD COLUMN     "address" "StudentAddress" NOT NULL DEFAULT 'other',
DROP
COLUMN "job",
ADD COLUMN     "job" "StudentJob" NOT NULL DEFAULT 'other';
