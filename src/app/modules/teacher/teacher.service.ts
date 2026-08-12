import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/appError";
import status from "http-status";
import {
  ICreateAssignmentPayload,
  IUpdateAssignmentPayload,
  IAssignmentFilters,
  IGradeSubmissionPayload,
  IChangeSubmissionStatusPayload,
} from "./teacher.interface";

const createAssignment = async (teacherId: string, payload: ICreateAssignmentPayload) => {
  const [teacher, klass, subject] = await Promise.all([
    prisma.teacher.findUnique({ where: { id: teacherId } }),
    prisma.class.findUnique({ where: { id: payload.classId } }),
    prisma.subject.findUnique({ where: { id: payload.subjectId } }),
  ]);

  if (!teacher) throw new AppError(status.NOT_FOUND, "Teacher not found");
  if (!klass) throw new AppError(status.NOT_FOUND, "Class not found");
  if (!subject) throw new AppError(status.NOT_FOUND, "Subject not found");

  return prisma.assignment.create({
    data: {
      title: payload.title,
      description: payload.description,
      deadline: new Date(payload.deadline),
      maxMarks: payload.maxMarks,
      classId: payload.classId,
      subjectId: payload.subjectId,
      teacherId,
      status: payload.status || undefined,
    },
  });
};

const updateAssignment = async (teacherId: string, id: string, payload: IUpdateAssignmentPayload) => {
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) throw new AppError(status.NOT_FOUND, "Assignment not found");
  if (assignment.teacherId !== teacherId) throw new AppError(status.FORBIDDEN, "Not authorized to update this assignment");

  const data: any = { ...payload };
  if (payload.deadline) data.deadline = new Date(payload.deadline as string);

  return prisma.assignment.update({ where: { id }, data });
};

const deleteAssignment = async (teacherId: string, id: string) => {
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) throw new AppError(status.NOT_FOUND, "Assignment not found");
  if (assignment.teacherId !== teacherId) throw new AppError(status.FORBIDDEN, "Not authorized to delete this assignment");

  return prisma.assignment.delete({ where: { id } });
};

const changeAssignmentStatus = async (teacherId: string, id: string, statusVal: string) => {
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) throw new AppError(status.NOT_FOUND, "Assignment not found");
  if (assignment.teacherId !== teacherId) throw new AppError(status.FORBIDDEN, "Not authorized to update this assignment");

  return prisma.assignment.update({ where: { id }, data: { status: statusVal as any } });
};

const getMyAssignments = async (teacherId: string, filters: IAssignmentFilters) => {
  const { classId, subjectId, status: assignmentStatus } = filters;

  return prisma.assignment.findMany({
    where: {
      teacherId,
      ...(classId && { classId }),
      ...(subjectId && { subjectId }),
      ...(assignmentStatus && { status: assignmentStatus as any }),
    },
    include: { class: true, subject: true, _count: { select: { submissions: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const getSubmissionsForAssignment = async (teacherId: string, assignmentId: string) => {
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) throw new AppError(status.NOT_FOUND, "Assignment not found");
  if (assignment.teacherId !== teacherId) throw new AppError(status.FORBIDDEN, "Not authorized to view submissions for this assignment");

  return prisma.submission.findMany({ where: { assignmentId }, include: { student: true, files: true }, orderBy: { submittedAt: "desc" } });
};

const gradeSubmission = async (teacherId: string, submissionId: string, payload: IGradeSubmissionPayload) => {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId }, include: { assignment: true } });
  if (!submission) throw new AppError(status.NOT_FOUND, "Submission not found");
  if (submission.assignment.teacherId !== teacherId) throw new AppError(status.FORBIDDEN, "Not authorized to grade this submission");

  return prisma.submission.update({ where: { id: submissionId }, data: { marks: payload.marks, feedback: payload.feedback, status: payload.status || submission.status, gradedAt: new Date() } });
};

const changeSubmissionStatus = async (teacherId: string, submissionId: string, payload: IChangeSubmissionStatusPayload) => {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId }, include: { assignment: true } });
  if (!submission) throw new AppError(status.NOT_FOUND, "Submission not found");
  if (submission.assignment.teacherId !== teacherId) throw new AppError(status.FORBIDDEN, "Not authorized to change this submission status");

  return prisma.submission.update({ where: { id: submissionId }, data: { status: payload.status } });
};

export const teacherService = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  changeAssignmentStatus,
  getMyAssignments,
  getSubmissionsForAssignment,
  gradeSubmission,
  changeSubmissionStatus,
};
