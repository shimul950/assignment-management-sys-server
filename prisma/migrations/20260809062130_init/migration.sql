/*
  Warnings:

  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('BLOCKED', 'DELETED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'LATE', 'GRADED', 'RETURNED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needPasswordChange" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "Subject";

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "maxMarks" INTEGER NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'DRAFT',
    "teacherId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_attachments" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrollments" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_files" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "answer" TEXT,
    "marks" INTEGER,
    "feedback" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gradedAt" TIMESTAMP(3),

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_assignments" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assignments_teacherId_idx" ON "assignments"("teacherId");

-- CreateIndex
CREATE INDEX "assignments_classId_idx" ON "assignments"("classId");

-- CreateIndex
CREATE INDEX "assignments_subjectId_idx" ON "assignments"("subjectId");

-- CreateIndex
CREATE INDEX "assignments_status_idx" ON "assignments"("status");

-- CreateIndex
CREATE INDEX "assignments_deadline_idx" ON "assignments"("deadline");

-- CreateIndex
CREATE INDEX "assignments_classId_status_idx" ON "assignments"("classId", "status");

-- CreateIndex
CREATE INDEX "assignments_teacherId_status_idx" ON "assignments"("teacherId", "status");

-- CreateIndex
CREATE INDEX "assignments_classId_subjectId_idx" ON "assignments"("classId", "subjectId");

-- CreateIndex
CREATE INDEX "assignment_attachments_assignmentId_idx" ON "assignment_attachments"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_code_key" ON "classes"("code");

-- CreateIndex
CREATE INDEX "classes_name_idx" ON "classes"("name");

-- CreateIndex
CREATE INDEX "student_enrollments_student_id_idx" ON "student_enrollments"("student_id");

-- CreateIndex
CREATE INDEX "student_enrollments_class_id_idx" ON "student_enrollments"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollments_student_id_class_id_key" ON "student_enrollments"("student_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE INDEX "subjects_name_idx" ON "subjects"("name");

-- CreateIndex
CREATE INDEX "submission_files_submission_id_idx" ON "submission_files"("submission_id");

-- CreateIndex
CREATE INDEX "submissions_assignmentId_idx" ON "submissions"("assignmentId");

-- CreateIndex
CREATE INDEX "submissions_studentId_idx" ON "submissions"("studentId");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE INDEX "submissions_assignmentId_status_idx" ON "submissions"("assignmentId", "status");

-- CreateIndex
CREATE INDEX "submissions_studentId_status_idx" ON "submissions"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_assignmentId_studentId_key" ON "submissions"("assignmentId", "studentId");

-- CreateIndex
CREATE INDEX "teacher_assignments_teacher_id_idx" ON "teacher_assignments"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_assignments_class_id_idx" ON "teacher_assignments"("class_id");

-- CreateIndex
CREATE INDEX "teacher_assignments_subject_id_idx" ON "teacher_assignments"("subject_id");

-- CreateIndex
CREATE INDEX "teacher_assignments_teacher_id_class_id_idx" ON "teacher_assignments"("teacher_id", "class_id");

-- CreateIndex
CREATE INDEX "teacher_assignments_class_id_subject_id_idx" ON "teacher_assignments"("class_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_assignments_teacher_id_class_id_subject_id_key" ON "teacher_assignments"("teacher_id", "class_id", "subject_id");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_attachments" ADD CONSTRAINT "assignment_attachments_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
