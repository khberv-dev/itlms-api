/*
  Warnings:

  - You are about to drop the column `title` on the `group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "group" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
