/*
  Warnings:

  - A unique constraint covering the columns `[student_id]` on the table `sale` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `student_id` to the `sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sale"
    ADD COLUMN "student_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sale_student_id_key" ON "sale" ("student_id");

-- AddForeignKey
ALTER TABLE "sale"
    ADD CONSTRAINT "sale_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
