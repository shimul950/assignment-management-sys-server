import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/appError";
import status from "http-status";
import { ISubmitPayload, IAssignmentFilters } from "./student.interface";

const getAssignedAssignments = async (userId: string, filters: IAssignmentFilters) => {
  const student = await prisma.student.findUnique({ where: { userId }, include: { studentEnrollments: true } });
  if (!student) throw new AppError(status.NOT_FOUND, "Student not found");

  const classIds = student.studentEnrollments.map((e) => e.classId);

  return prisma.assignment.findMany({
    where: {
      classId: { in: classIds },
      ...(filters.classId && { classId: filters.classId }),
      ...(filters.subjectId && { subjectId: filters.subjectId }),
      ...(filters.status && { status: filters.status as any }),
    },
    include: { teacher: true, class: true, subject: true, _count: { select: { submissions: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const getAssignmentDetails = async (userId: string, assignmentId: string) => {
  const student = await prisma.student.findUnique({ where: { userId }, include: { studentEnrollments: true } });
  if (!student) throw new AppError(status.NOT_FOUND, "Student not found");

  const classIds = student.studentEnrollments.map((e) => e.classId);

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, include: { attachments: true, teacher: true, class: true, subject: true } });
  if (!assignment) throw new AppError(status.NOT_FOUND, "Assignment not found");

  if (!classIds.includes(assignment.classId)) {
    throw new AppError(status.FORBIDDEN, "Not authorized to view this assignment");
  }

  // Include the student's submission if exists
  const submission = await prisma.submission.findFirst({ where: { assignmentId, studentId: student.id }, include: { files: true } });

  return { assignment, submission };
};

const submitAnswer = async (userId: string, assignmentId: string, payload: ISubmitPayload) => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new AppError(status.NOT_FOUND, "Student not found");

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) throw new AppError(status.NOT_FOUND, "Assignment not found");

  const now = new Date();
  if (now > new Date(assignment.deadline)) {
    throw new AppError(status.BAD_REQUEST, "Deadline has passed");
  }

  const existing = await prisma.submission.findFirst({ where: { assignmentId, studentId: student.id } });

  if (existing) {
    // update
    return prisma.submission.update({
      where: { id: existing.id },
      data: {
        answer: payload.answer ?? existing.answer,
        updatedAt: new Date(),
        files: payload.files ? { deleteMany: {}, create: payload.files } : undefined,
      },
      include: { files: true },
    });
  }

  // create
  return prisma.submission.create({
    data: {
      assignmentId,
      studentId: student.id,
      answer: payload.answer,
      files: payload.files ? { create: payload.files } : undefined,
    },
    include: { files: true },
  });
};

const getMySubmissions = async (userId: string) => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new AppError(status.NOT_FOUND, "Student not found");

  return prisma.submission.findMany({ where: { studentId: student.id }, include: { assignment: { select: { id: true, title: true, deadline: true, maxMarks: true } }, files: true }, orderBy: { submittedAt: "desc" } });
};

const getSingleSubmission = async (userId: string, submissionId: string) => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new AppError(status.NOT_FOUND, "Student not found");

  const submission = await prisma.submission.findUnique({ where: { id: submissionId }, include: { files: true, assignment: true } });
  if (!submission) throw new AppError(status.NOT_FOUND, "Submission not found");
  if (submission.studentId !== student.id) throw new AppError(status.FORBIDDEN, "Not authorized to view this submission");

  return submission;
};

export const studentService = {
  getAssignedAssignments,
  getAssignmentDetails,
  submitAnswer,
  getMySubmissions,
  getSingleSubmission,
};
