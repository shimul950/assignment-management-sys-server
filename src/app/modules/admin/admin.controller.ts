import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponce } from "../../shared/sendResponce";
import { adminService } from "./admin.service";
import pick from "../../shared/pick"; 

// ---------- Users ----------

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "role", "status"]);
  const result = await adminService.getAllUsers(filters);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getSingleUser(req.params.id as string);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});



const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.updateUserStatus(req.params.id as string, req.body);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.softDeleteUser(req.params.id as string);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

// ---------- Classes ----------

const createClass = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.createClass(req.body);

  sendResponce(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Class created successfully",
    data: result,
  });
});

const getAllClasses = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllClasses();

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Classes retrieved successfully",
    data: result,
  });
});

const updateClass = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.updateClass(req.params.id as string, req.body);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Class updated successfully",
    data: result,
  });
});

const deleteClass = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.deleteClass(req.params.id as string);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Class deleted successfully",
    data: result,
  });
});

// ---------- Subjects ----------

const createSubject = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.createSubject(req.body);

  sendResponce(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Subject created successfully",
    data: result,
  });
});

const getAllSubjects = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllSubjects();

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Subjects retrieved successfully",
    data: result,
  });
});

const updateSubject = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.updateSubject(req.params.id as string, req.body);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Subject updated successfully",
    data: result,
  });
});

const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.deleteSubject(req.params.id as string);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Subject deleted successfully",
    data: result,
  });
});

// ---------- Teacher assignment ----------

const assignTeacher = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.assignTeacher(req.body);

  sendResponce(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Teacher assigned successfully",
    data: result,
  });
});

const unassignTeacher = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.unassignTeacher(req.params.id as string);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Teacher unassigned successfully",
    data: result,
  });
});

const getAllTeacherAssignments = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["teacherId", "classId", "subjectId"]);
  const result = await adminService.getAllTeacherAssignments(filters);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Teacher assignments retrieved successfully",
    data: result,
  });
});

// ---------- Assignments / Submissions (view) ----------

const getAllAssignments = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["classId", "subjectId", "teacherId", "status"]);
  const result = await adminService.getAllAssignments(filters);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Assignments retrieved successfully",
    data: result,
  });
});

const getSingleAssignment = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getSingleAssignment(req.params.id as string);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Assignment retrieved successfully",
    data: result,
  });
});

const getAllSubmissions = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["assignmentId", "studentId", "status"]);
  const result = await adminService.getAllSubmissions(filters);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Submissions retrieved successfully",
    data: result,
  });
});

// ---------- Settings ----------

const getAllSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllSettings();

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Settings retrieved successfully",
    data: result,
  });
});

const upsertSetting = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.upsertSetting(req.body);

  sendResponce(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Setting updated successfully",
    data: result,
  });
});

export const adminController = {
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  deleteUser,

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