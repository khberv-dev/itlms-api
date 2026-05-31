/*
  Warnings:

  - A unique constraint covering the columns `[student_id,group_id,date]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "attendance_student_id_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "attendance_student_id_group_id_date_key" ON "attendance" ("student_id", "group_id", "date");
