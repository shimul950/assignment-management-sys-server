import { AssignmentStatus } from "../../../generated/prisma/enums";

export type ISubmitPayload = {
  answer?: string;
  files?: Array<{
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }>;
};

export type IAssignmentFilters = {
  classId?: string;
  subjectId?: string;
  status?: AssignmentStatus | string;
};
