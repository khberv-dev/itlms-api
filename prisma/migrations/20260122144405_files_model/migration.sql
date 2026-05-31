-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('collecting', 'active', 'paused', 'closed');

-- AlterTable
ALTER TABLE "group"
    ADD COLUMN "status" "GroupStatus" NOT NULL DEFAULT 'collecting';

-- CreateTable
CREATE TABLE "file"
(
    "id"            TEXT         NOT NULL,
    "key"           TEXT         NOT NULL,
    "url"           TEXT         NOT NULL,
    "original_name" TEXT         NOT NULL,
    "mime_type"     TEXT         NOT NULL,
    "size"          INTEGER      NOT NULL,
    "bucket"        TEXT         NOT NULL,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_key_key" ON "file" ("key");
