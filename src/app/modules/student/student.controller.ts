import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponce } from "../../shared/sendResponce";
import { studentService } from "./student.service";
import pick from "../../shared/pick";

const getAssignedAssignments = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["classId", "subjectId", "status"]);
  const result = await studentService.getAssignedAssignments(req.user!.userId, filters);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Assignments retrieved successfully", data: result });
});

const getAssignmentDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await studentService.getAssignmentDetails(req.user!.userId, req.params.id as string);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Assignment details retrieved successfully", data: result });
});

const submitAnswer = catchAsync(async (req: Request, res: Response) => {
  const result = await studentService.submitAnswer(req.user!.userId, req.params.id as string, req.body);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Submission saved successfully", data: result });
});

const getMySubmissions = catchAsync(async (req: Request, res: Response) => {
  const result = await studentService.getMySubmissions(req.user!.userId);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Submissions retrieved successfully", data: result });
});

const getSingleSubmission = catchAsync(async (req: Request, res: Response) => {
  const result = await studentService.getSingleSubmission(req.user!.userId, req.params.id as string);

  sendResponce(res, { httpStatusCode: status.OK, success: true, message: "Submission retrieved successfully", data: result });
});

export const studentController = {
  getAssignedAssignments,
  getAssignmentDetails,
  submitAnswer,
  getMySubmissions,
  getSingleSubmission,
};
