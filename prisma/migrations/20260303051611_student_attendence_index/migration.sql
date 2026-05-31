/*
  Warnings:

  - A unique constraint covering the columns `[student_id,date]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "attendance_student_id_date_key" ON "attendance" ("student_id", "date");
