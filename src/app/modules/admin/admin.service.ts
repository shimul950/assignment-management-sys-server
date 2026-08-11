 
import { APIError } from "better-auth";
import { prisma } from "../../lib/prisma";
import {
  ICreateTeacherPayload,
  ICreateClassPayload,
  ICreateSubjectPayload,
  IAssignTeacherPayload,
  IAssignmentFilters,
  ISubmissionFilters,
  IUpdateSettingPayload,
  IUpdateUserStatusPayload,
  IUserFilters,
} from "./admin.interface";
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/appError";


// ================= USERS =================

const getAllUsers = async (filters: IUserFilters) => {
  const { searchTerm, role, status: userStatus } = filters;

  return prisma.user.findMany({
    where: {
      isDeleted: false,
      ...(role && { role }),
      ...(userStatus && { status: userStatus }),
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      student: true,
      teacher: true,
      admin: true,
      superAdmin: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getSingleUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { student: true, teacher: true, admin: true, superAdmin: true },
  });

  if (!user || user.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  return user;
};

const updateUserStatus = async (id: string, payload: IUpdateUserStatusPayload) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { status: payload.status },
  });
};

const softDeleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

// ================= CLASSES =================

const createClass = async (payload: ICreateClassPayload) => {
  return prisma.class.create({ data: payload });
};

const getAllClasses = async () => {
  return prisma.class.findMany({
    include: { _count: { select: { studentEnrollments: true, assignments: true } } },
    orderBy: { name: "asc" },
  });
};

const updateClass = async (id: string, payload: Partial<ICreateClassPayload>) => {
  return prisma.class.update({ where: { id }, data: payload });
};

const deleteClass = async (id: string) => {
  // Hard delete — no isDeleted flag on Class. Cascades to assignments/submissions.
  return prisma.class.delete({ where: { id } });
};

// ================= SUBJECTS =================

const createSubject = async (payload: ICreateSubjectPayload) => {
  return prisma.subject.create({ data: payload });
};

const getAllSubjects = async () => {
  return prisma.subject.findMany({ orderBy: { name: "asc" } });
};

const updateSubject = async (id: string, payload: Partial<ICreateSubjectPayload>) => {
  return prisma.subject.update({ where: { id }, data: payload });
};

const deleteSubject = async (id: string) => {
  return prisma.subject.delete({ where: { id } });
};

// ================= TEACHER ASSIGNMENT =================

const assignTeacher = async (payload: IAssignTeacherPayload) => {
  const [teacher, klass, subject] = await Promise.all([
    prisma.teacher.findUnique({ where: { id: payload.teacherId } }),
    prisma.class.findUnique({ where: { id: payload.classId } }),
    prisma.subject.findUnique({ where: { id: payload.subjectId } }),
  ]);

  if (!teacher) throw new AppError(status.NOT_FOUND, "Teacher not found");
  if (!klass) throw new AppError(status.NOT_FOUND, "Class not found");
  if (!subject) throw new AppError(status.NOT_FOUND, "Subject not found");

  return prisma.teacherAssignment.create({ data: payload });
};

const unassignTeacher = async (id: string) => {
  return prisma.teacherAssignment.delete({ where: { id } });
};

const getAllTeacherAssignments = async (filters: {
  teacherId?: string;
  classId?: string;
  subjectId?: string;
}) => {
  return prisma.teacherAssignment.findMany({
    where: filters,
    include: { teacher: true, class: true, subject: true },
  });
};

// ================= VIEW ASSIGNMENTS / SUBMISSIONS =================

const getAllAssignments = async (filters: IAssignmentFilters) => {
  const { classId, subjectId, teacherId, status: assignmentStatus } = filters;

  return prisma.assignment.findMany({
    where: {
      ...(classId && { classId }),
      ...(subjectId && { subjectId }),
      ...(teacherId && { teacherId }),
      ...(assignmentStatus && { status: assignmentStatus as any }),
    },
    include: {
      teacher: true,
      class: true,
      subject: true,
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getSingleAssignment = async (id: string) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      teacher: true,
      class: true,
      subject: true,
      attachments: true,
      submissions: { include: { student: true, files: true } },
    },
  });

  if (!assignment) throw new AppError(status.NOT_FOUND, "Assignment not found");
  return assignment;
};

const getAllSubmissions = async (filters: ISubmissionFilters) => {
  const { assignmentId, studentId, status: submissionStatus } = filters;

  return prisma.submission.findMany({
    where: {
      ...(assignmentId && { assignmentId }),
      ...(studentId && { studentId }),
      ...(submissionStatus && { status: submissionStatus as any }),
    },
    include: {
      student: true,
      assignment: { select: { title: true, classId: true, subjectId: true } },
      files: true,
    },
    orderBy: { submittedAt: "desc" },
  });
};

// ================= SETTINGS =================

const getAllSettings = async () => {
  return prisma.setting.findMany();
};

const upsertSetting = async (payload: IUpdateSettingPayload) => {
  return prisma.setting.upsert({
    where: { key: payload.key },
    update: { value: payload.value },
    create: { key: payload.key, value: payload.value },
  });
};

export const adminService = {
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  softDeleteUser,

  createClass,
  getAllClasses,
  updateClass,
  deleteClass,

  createSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject,

  assignTeacher,
  unassignTeacher,
  getAllTeacherAssignments,

  getAllAssignments,
  getSingleAssignment,
  getAllSubmissions,

  getAllSettings,
  upsertSetting,
};