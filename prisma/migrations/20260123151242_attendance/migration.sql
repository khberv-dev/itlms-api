-- CreateTable
CREATE TABLE "attendance"
(
    "id"         TEXT         NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date"       DATE         NOT NULL,
    "student_id" TEXT         NOT NULL,
    "group_id"   TEXT         NOT NULL,
    "mentor_id"  TEXT         NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "attendance"
    ADD CONSTRAINT "attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance"
    ADD CONSTRAINT "attendance_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance"
    ADD CONSTRAINT "attendance_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
