/*
  Warnings:

  - A unique constraint covering the columns `[avatar_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user"
    ADD COLUMN "avatar_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_avatar_id_key" ON "user" ("avatar_id");

-- AddForeignKey
ALTER TABLE "user"
    ADD CONSTRAINT "user_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "file" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
