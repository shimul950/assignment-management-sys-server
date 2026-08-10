/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";

interface ResponceData <T> {
    httpStatusCode: number;
    success:boolean;
    message:string;
    data?: T;
    meta?: any;
}

export const sendResponce = <T> (res: Response, responceData: ResponceData<T>) => {
    const{httpStatusCode, success, message, data, meta} = responceData;

    res.status(httpStatusCode).json({
        success,
        message,
        data,
        meta
    })
}