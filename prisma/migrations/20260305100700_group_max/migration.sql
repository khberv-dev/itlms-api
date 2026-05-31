/*
  Warnings:

  - Made the column `max_students` on table `group` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "group"
    ALTER COLUMN "max_students" SET NOT NULL;
