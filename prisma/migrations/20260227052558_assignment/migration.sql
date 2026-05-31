-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('active', 'closed');

-- CreateTable
CREATE TABLE "assignment_submission" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "content" TEXT,
    "file_url" TEXT,
    "score" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "assignment_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "max_score" INTEGER NOT NULL DEFAULT 10,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "group_id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,

    CONSTRAINT "assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submission_assignment_id_student_id_key" ON "assignment_submission"("assignment_id", "student_id");

-- AddForeignKey
ALTER TABLE "assignment_submission" ADD CONSTRAINT "assignment_submission_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submission" ADD CONSTRAINT "assignment_submission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
