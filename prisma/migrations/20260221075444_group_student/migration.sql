-- CreateTable
CREATE TABLE "group_student"
(
    "id"           TEXT         NOT NULL,
    "group_id"     TEXT         NOT NULL,
    "student_id"   TEXT         NOT NULL,
    "mentor_id"    TEXT,
    "assistant_id" TEXT,
    "joined_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at"      TIMESTAMP(3),

    CONSTRAINT "group_student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_student_student_id_idx" ON "group_student" ("student_id");

-- CreateIndex
CREATE INDEX "group_student_group_id_idx" ON "group_student" ("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_student_group_id_student_id_left_at_key" ON "group_student" ("group_id", "student_id", "left_at");

-- AddForeignKey
ALTER TABLE "group_student"
    ADD CONSTRAINT "group_student_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_student"
    ADD CONSTRAINT "group_student_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_student"
    ADD CONSTRAINT "group_student_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_student"
    ADD CONSTRAINT "group_student_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "mentor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
