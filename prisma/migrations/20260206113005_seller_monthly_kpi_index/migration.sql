/*
  Warnings:

  - A unique constraint covering the columns `[seller_id,year,month]` on the table `seller_monthly_kpi` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "seller_monthly_kpi_seller_id_year_month_key" ON "seller_monthly_kpi"("seller_id", "year", "month");
