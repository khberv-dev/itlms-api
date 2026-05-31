/*
  Warnings:

  - You are about to drop the column `mentoring_done` on the `seller_monthly_kpi` table. All the data in the column will be lost.
  - You are about to drop the column `sales_plan_completed` on the `seller_monthly_kpi` table. All the data in the column will be lost.
  - You are about to drop the column `weekly_sales_plan` on the `seller_monthly_kpi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "seller"
    ADD COLUMN "today_work_start_time" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "seller_daily_kpi"
    ADD COLUMN "calls_count" INTEGER,
ADD COLUMN     "calls_target" INTEGER DEFAULT 45,
ADD COLUMN     "started_time" TEXT,
ADD COLUMN     "started_time_target" TEXT,
ADD COLUMN     "talk_time_seconds" INTEGER,
ADD COLUMN     "talk_time_target" INTEGER DEFAULT 9000,
ALTER
COLUMN "started_on_time" DROP
NOT NULL,
ALTER
COLUMN "calls_done" DROP
NOT NULL,
ALTER
COLUMN "talk_time_done" DROP
NOT NULL,
ALTER
COLUMN "qa_passed" DROP
NOT NULL;

-- AlterTable
ALTER TABLE "seller_monthly_kpi" DROP COLUMN "mentoring_done",
DROP
COLUMN "sales_plan_completed",
DROP
COLUMN "weekly_sales_plan",
ADD COLUMN     "sale_completed" BOOLEAN,
ADD COLUMN     "sale_sum" INTEGER,
ADD COLUMN     "sale_target" INTEGER,
ALTER
COLUMN "conversion_completed" DROP
NOT NULL;
