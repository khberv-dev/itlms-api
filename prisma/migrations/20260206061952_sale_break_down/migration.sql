-- CreateTable
CREATE TABLE "sale_break_down" (
    "id" TEXT NOT NULL,
    "sale_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "days_count" INTEGER NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_break_down_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sale_break_down_year_month_idx" ON "sale_break_down"("year", "month");

-- AddForeignKey
ALTER TABLE "sale_break_down" ADD CONSTRAINT "sale_break_down_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_break_down" ADD CONSTRAINT "sale_break_down_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
