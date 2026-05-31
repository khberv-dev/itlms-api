/*
  Warnings:

  - You are about to drop the column `mime_type` on the `file` table. All the data in the column will be lost.
  - You are about to drop the column `original_name` on the `file` table. All the data in the column will be lost.
  - Added the required column `filename` to the `file` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file" DROP COLUMN "mime_type",
DROP
COLUMN "original_name",
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mimetype" TEXT NOT NULL;
