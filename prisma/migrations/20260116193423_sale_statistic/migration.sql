/*
  Warnings:

  - You are about to alter the column `sum` on the `sale` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.

*/
-- DropForeignKey
ALTER TABLE "sale" DROP CONSTRAINT "sale_seller_id_fkey";

-- DropIndex
DROP INDEX "sale_seller_id_key";

-- DropIndex
DROP INDEX "sale_student_id_key";

-- AlterTable
ALTER TABLE "sale"
    ALTER COLUMN "sum" SET DATA TYPE DECIMAL(18, 2) ,
ALTER
COLUMN "seller_id" DROP
NOT NULL;

-- AlterTable
ALTER TABLE "seller"
    ADD COLUMN "amocrm_id" TEXT,
ADD COLUMN     "sip" INTEGER;

-- AlterTable
ALTER TABLE "student"
    ADD COLUMN "access_expires_at" TIMESTAMP(3),
ADD COLUMN     "seller_id" TEXT;

-- CreateTable
CREATE TABLE "seller_daily_statistic"
(
    "id"                           TEXT    NOT NULL,
    "date"                         DATE    NOT NULL,
    "time"                         INTEGER NOT NULL DEFAULT 0,
    "total_count"                  INTEGER NOT NULL DEFAULT 0,
    "income_count"                 INTEGER NOT NULL DEFAULT 0,
    "outgoing_count"               INTEGER NOT NULL DEFAULT 0,
    "succes_count"                 INTEGER NOT NULL DEFAULT 0,
    "mentor_outgoing_succes_count" INTEGER NOT NULL DEFAULT 0,
    "mentor_income_succes_count"   INTEGER NOT NULL DEFAULT 0,
    "outgoing_succes_count"        INTEGER NOT NULL DEFAULT 0,
    "income_succes_count"          INTEGER NOT NULL DEFAULT 0,
    "failed_count"                 INTEGER NOT NULL DEFAULT 0,
    "income_call_time"             INTEGER NOT NULL DEFAULT 0,
    "outgoing_call_time"           INTEGER NOT NULL DEFAULT 0,
    "leads_count"                  INTEGER NOT NULL DEFAULT 0,
    "seller_id"                    TEXT    NOT NULL,

    CONSTRAINT "seller_daily_statistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_month_plan"
(
    "id"        TEXT           NOT NULL,
    "date"      DATE           NOT NULL,
    "plan"      DECIMAL(18, 0) NOT NULL,
    "sale"      DECIMAL(18, 0),
    "seller_id" TEXT           NOT NULL,

    CONSTRAINT "seller_month_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_month_plan"
(
    "id"   TEXT           NOT NULL,
    "date" DATE           NOT NULL,
    "plan" DECIMAL(18, 0) NOT NULL,
    "sale" DECIMAL(18, 0),

    CONSTRAINT "sale_month_plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seller_daily_statistic_seller_id_date_key" ON "seller_daily_statistic" ("seller_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "seller_month_plan_seller_id_date_key" ON "seller_month_plan" ("seller_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "sale_month_plan_date_key" ON "sale_month_plan" ("date");

-- AddForeignKey
ALTER TABLE "sale"
    ADD CONSTRAINT "sale_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student"
    ADD CONSTRAINT "student_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_daily_statistic"
    ADD CONSTRAINT "seller_daily_statistic_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_month_plan"
    ADD CONSTRAINT "seller_month_plan_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
