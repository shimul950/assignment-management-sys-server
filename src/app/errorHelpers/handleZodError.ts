import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";

export const handleZodError = (err: z.ZodError): TErrorResponse => {
    const statusCode = status.BAD_REQUEST;
    const message = "Zod validation error";
    const errorSource :TErrorSources[]=[]

    err.issues.forEach(issue => {
        errorSource.push({
            path: issue.path.length > 1 ? issue.path.join(" => ") : issue.path[0].toString(),
            message: issue.message
        })
    })

    return{
        success: false,
        message,
        errorSource,
        statusCode
    }
}