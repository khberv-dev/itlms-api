/*
  Warnings:

  - A unique constraint covering the columns `[file_id]` on the table `sale` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "sale" ADD COLUMN     "file_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "sale_file_id_key" ON "sale"("file_id");

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
