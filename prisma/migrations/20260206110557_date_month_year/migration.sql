/*
  Warnings:

  - You are about to drop the column `date` on the `sale_month_plan` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `seller_month_plan` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `seller_monthly_kpi` table. All the data in the column will be lost.
  - Added the required column `month` to the `sale_month_plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `sale_month_plan` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `conversion_completed` on the `seller_monthly_kpi` table.
*/

-- Drop old unique indexes
DROP INDEX IF EXISTS "sale_month_plan_date_key";
DROP INDEX IF EXISTS "seller_month_plan_seller_id_date_key";
DROP INDEX IF EXISTS "seller_monthly_kpi_seller_id_date_key";

-- ==========================
-- sale_month_plan
-- ==========================
ALTER TABLE "sale_month_plan"
DROP
COLUMN "date",
ADD COLUMN "year" INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
ADD COLUMN "month" INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE);

-- ==========================
-- seller_month_plan
-- ==========================
ALTER TABLE "seller_month_plan"
DROP
COLUMN "date",
ADD COLUMN "year" INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
ADD COLUMN "month" INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE);

-- ==========================
-- seller_monthly_kpi
-- ==========================
ALTER TABLE "seller_monthly_kpi"
DROP
COLUMN "date",
ADD COLUMN "year" INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
ADD COLUMN "month" INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
DROP
COLUMN "conversion_completed",
ADD COLUMN "conversion_completed" JSONB NOT NULL;
