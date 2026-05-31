-- AlterTable
ALTER TABLE "seller_daily_statistic" ADD COLUMN     "failed_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "income_call_time" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "income_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "income_succes_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "outgoing_call_time" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "outgoing_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "outgoing_succes_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "succes_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "time" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "seller_daily_kpi" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "started_on_time" BOOLEAN NOT NULL,
    "calls_done" BOOLEAN NOT NULL,
    "talk_time_done" BOOLEAN NOT NULL,
    "qa_passed" BOOLEAN NOT NULL,
    "seller_id" TEXT NOT NULL,

    CONSTRAINT "seller_daily_kpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_monthly_kpi" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sales_plan_completed" BOOLEAN NOT NULL,
    "conversion_completed" BOOLEAN NOT NULL,
    "mentoring_done" BOOLEAN NOT NULL,
    "weekly_sales_plan" JSONB NOT NULL,
    "seller_id" TEXT NOT NULL,

    CONSTRAINT "seller_monthly_kpi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seller_daily_kpi_seller_id_date_key" ON "seller_daily_kpi"("seller_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "seller_monthly_kpi_seller_id_date_key" ON "seller_monthly_kpi"("seller_id", "date");

-- AddForeignKey
ALTER TABLE "seller_daily_kpi" ADD CONSTRAINT "seller_daily_kpi_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_monthly_kpi" ADD CONSTRAINT "seller_monthly_kpi_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
