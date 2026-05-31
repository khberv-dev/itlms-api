-- AlterTable
ALTER TABLE "group"
    ADD COLUMN "level_id" TEXT;

-- CreateTable
CREATE TABLE "group_level"
(
    "id"         TEXT         NOT NULL,
    "level"      TEXT         NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor"
(
    "id"      TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "mentor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentor_user_id_key" ON "mentor" ("user_id");

-- AddForeignKey
ALTER TABLE "group"
    ADD CONSTRAINT "group_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "group_level" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor"
    ADD CONSTRAINT "mentor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
