/*
  Warnings:

  - Added the required column `role` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'rop', 'seller', 'mentor', 'assistant', 'admin');

-- AlterTable
ALTER TABLE "user"
    ADD COLUMN "role" "Role" NOT NULL;

-- CreateTable
CREATE TABLE "seller"
(
    "id"      TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "seller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seller_user_id_key" ON "seller" ("user_id");

-- AddForeignKey
ALTER TABLE "seller"
    ADD CONSTRAINT "seller_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
