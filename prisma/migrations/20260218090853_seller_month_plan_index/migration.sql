/*
  Warnings:

  - A unique constraint covering the columns `[seller_id,year,month]` on the table `seller_month_plan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "seller_month_plan_seller_id_year_month_key" ON "seller_month_plan"("seller_id", "year", "month");
