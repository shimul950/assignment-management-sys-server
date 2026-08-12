import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponce } from "../../shared/sendResponce";
import { teacherService } from "./teacher.service";
import pick from "../../shared/pick";

const createAssignment = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await teacherService.createAssignment(req.user!.userId, payload);

  sendResponce(res, { httpStatusCode: status.CREATED, success: true, message: "Assignment created successfully", data: result });
});

const updateAssignment = catchAsync(async (req: Request, res: Response) => {
  const result = await teacherService.updateAssignment(req.user!.userId, req.params.id as string, req.body);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Assignment updated successfully", data: result });
});

const deleteAssignment = catchAsync(async (req: Request, res: Response) => {
  const result = await teacherService.deleteAssignment(req.user!.userId, req.params.id as string);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Assignment deleted successfully", data: result });
});

const changeAssignmentStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await teacherService.changeAssignmentStatus(req.user!.userId, req.params.id as string, req.body.status as string);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Assignment status updated successfully", data: result });
});

const getMyAssignments = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["classId", "subjectId", "status"]);
  const result = await teacherService.getMyAssignments(req.user!.userId, filters);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Assignments retrieved successfully", data: result });
});

const getSubmissions = catchAsync(async (req: Request, res: Response) => {
  const result = await teacherService.getSubmissionsForAssignment(req.user!.userId, req.params.id as string);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Submissions retrieved successfully", data: result });
});

const gradeSubmission = catchAsync(async (req: Request, res: Response) => {
  const result = await teacherService.gradeSubmission(req.user!.userId, req.params.id as string, req.body);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Submission graded successfully", data: result });
});

const changeSubmissionStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await teacherService.changeSubmissionStatus(req.user!.userId, req.params.id as string, req.body);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Submission status updated successfully", data: result });
});

export const teacherController = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  changeAssignmentStatus,
  getMyAssignments,
  getSubmissions,
  gradeSubmission,
  changeSubmissionStatus,
};
