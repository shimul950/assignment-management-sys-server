/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import { handleZodError } from "../errorHelpers/handleZodError";
// import { deleteFileFromCloudanary } from "../../config/cloudinary.config";



export const globalErrorHandler =async (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err);

    if (envVars.NODE_ENV === "development") {
        console.log("Error form global error handler", err);
    }

    // if(req.file){
    //   await deleteFileFromCloudanary(req.file.path)
    // }

    // if(req.files && Array.isArray(req.files) && req.files.length > 0){
    //   const imageUrls = req.files.map((file) => file.path);
    //   await Promise.all(imageUrls.map(url => deleteFileFromCloudanary(url)))
    // }

    let errorSource: TErrorSources[] = []
    let statusCode: number = status.INTERNAL_SERVER_ERROR
    let message: string = "Internal server error"
    let stack: string | undefined = undefined


    //zod error pattern
    /* [
      {
        expected: 'string',
        code: 'invalid_type',
        path: [ 'username' ],
        message: 'Invalid input: expected string'
      },
      {
        expected: 'number',
        code: 'invalid_type',
        path: [ 'xp' ],
        message: 'Invalid input: expected number'
      }
    ] */
   

    if (err instanceof z.ZodError) {
        const simplefiedError = handleZodError(err)
        statusCode = simplefiedError.statusCode as number;
        message = simplefiedError.message;
        errorSource = [...simplefiedError.errorSource!]
        
    }else if(err instanceof Error){
      statusCode = status.INTERNAL_SERVER_ERROR
      message = err.message
      stack = err.stack
    }

    const errorResponse: TErrorResponse = {
        success: false,
        message: message,
        errorSource,
        stack: envVars.NODE_ENV === "development" ? stack : undefined,
        error: envVars.NODE_ENV === "development" ? err : undefined
    }

    res.status(statusCode).json(errorResponse)
}