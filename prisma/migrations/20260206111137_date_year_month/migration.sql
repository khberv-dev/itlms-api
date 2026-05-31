-- AlterTable
ALTER TABLE "seller_month_plan" ALTER COLUMN "year" DROP NOT NULL,
ALTER COLUMN "month" DROP NOT NULL;

-- AlterTable
ALTER TABLE "seller_monthly_kpi" ALTER COLUMN "year" DROP NOT NULL,
ALTER COLUMN "month" DROP NOT NULL;
