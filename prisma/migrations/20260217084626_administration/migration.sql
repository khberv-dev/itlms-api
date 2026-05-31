-- CreateTable
CREATE TABLE "administration"
(
    "id"      TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "administration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administration_user_id_key" ON "administration" ("user_id");

-- AddForeignKey
ALTER TABLE "administration"
    ADD CONSTRAINT "administration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
