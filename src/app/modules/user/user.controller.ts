import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { userService } from "./user.service";
import { sendResponce } from "../../shared/sendResponce";
import status from "http-status";


const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req.body);

  sendResponce(res, {
    httpStatusCode:status.CREATED,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

const createSuperAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createSuperAdmin(req.body);

  sendResponce(res, {
    httpStatusCode:status.CREATED,
    success: true,
    message: "Super Admin created successfully",
    data: result,
  });
});

export const userController = {
    createAdmin,
    createSuperAdmin
}