import { Gender, Role, UserStatus } from "../../../generated/prisma/enums";


// ---------- Users ----------
export type IUserFilters = {
  searchTerm?: string;
  role?: Role;
  status?: UserStatus;
};

export type ICreateTeacherPayload = {
  name: string;
  email: string;
  password: string;
  contactNumber?: string;
  address?: string;
  gender: Gender;
  qualification: string;
  designation: string;
  experience?: number;
};


export type IUpdateUserStatusPayload = {
  status: UserStatus;
};

// ---------- Classes / Subjects ----------
export type ICreateClassPayload = {
  name: string;
  code: string;
};

export type ICreateSubjectPayload = {
  name: string;
  code: string;
};

// ---------- Teacher assignment ----------
export type IAssignTeacherPayload = {
  teacherId: string;
  classId: string;
  subjectId: string;
};

// ---------- Assignments / Submissions (read) ----------
export type IAssignmentFilters = {
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  status?: string;
};

export type ISubmissionFilters = {
  assignmentId?: string;
  studentId?: string;
  status?: string;
};

// ---------- Settings ----------
export type IUpdateSettingPayload = {
  key: string;
  value: string;
};