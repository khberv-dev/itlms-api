/*
  Warnings:

  - You are about to drop the column `failed_count` on the `seller_daily_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `income_call_time` on the `seller_daily_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `income_count` on the `seller_daily_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `income_succes_count` on the `seller_daily_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `mentor_income_succes_count` on the `seller_daily_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `mentor_outgoing_succes_count` on the `seller_daily_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `outgoing_call_time` on the `seller_daily_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `outgoing_count` on the `seller_daily_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `outgoing_succes_count` on the `seller_daily_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `succes_count` on the `seller_daily_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `seller_daily_statistic` table. All the data in the column will be lost.
  - You are about to drop the column `total_count` on the `seller_daily_statistic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "seller_daily_statistic" DROP COLUMN "failed_count",
DROP COLUMN "income_call_time",
DROP COLUMN "income_count",
DROP COLUMN "income_succes_count",
DROP COLUMN "mentor_income_succes_count",
DROP COLUMN "mentor_outgoing_succes_count",
DROP COLUMN "outgoing_call_time",
DROP COLUMN "outgoing_count",
DROP COLUMN "outgoing_succes_count",
DROP COLUMN "succes_count",
DROP COLUMN "time",
DROP COLUMN "total_count";

-- CreateTable
CREATE TABLE "group" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);
