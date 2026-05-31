-- AlterTable
ALTER TABLE "user"
    ADD COLUMN "gender" INTEGER;

-- CreateTable
CREATE TABLE "sale"
(
    "id"         TEXT            NOT NULL,
    "source"     TEXT            NOT NULL,
    "month"      INTEGER         NOT NULL,
    "sum"        DECIMAL(65, 30) NOT NULL,
    "created_at" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date"       TIMESTAMP(3)             DEFAULT CURRENT_TIMESTAMP,
    "seller_id"  TEXT            NOT NULL,

    CONSTRAINT "sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student"
(
    "id"       TEXT NOT NULL,
    "address"  TEXT,
    "job"      TEXT,
    "telegram" TEXT,
    "user_id"  TEXT NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sale_seller_id_key" ON "sale" ("seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_user_id_key" ON "student" ("user_id");

-- AddForeignKey
ALTER TABLE "sale"
    ADD CONSTRAINT "sale_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "seller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student"
    ADD CONSTRAINT "student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
