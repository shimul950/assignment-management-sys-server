import { AssignmentStatus, SubmissionStatus } from "../../../generated/prisma/enums";

export type ICreateAssignmentPayload = {
  title: string;
  description?: string;
  deadline: string;
  maxMarks: number;
  classId: string;
  subjectId: string;
  status?: AssignmentStatus;
};

export type IUpdateAssignmentPayload = Partial<ICreateAssignmentPayload>;

export type IGradeSubmissionPayload = {
  marks: number;
  feedback?: string;
  status?: SubmissionStatus;
};

export type IChangeSubmissionStatusPayload = {
  status: SubmissionStatus;
};

export type IAssignmentFilters = {
  classId?: string;
  subjectId?: string;
  status?: string;
};
