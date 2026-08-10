/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import { envVars } from '../src/config/env'
import AppError from '../src/app/errorHelpers/appError';
import status from 'http-status';
import path from 'path';
import ejs from 'ejs';

const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    secure: true,
    auth:{
        user:envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS
    },
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
})

interface SendEmailOptions{
    to: string
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[]
}

export const sendEmail = async({subject, templateData, templateName, to, attachments}: SendEmailOptions ) =>{
    try{
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);

        const html = await ejs.renderFile(templatePath, templateData);

        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map((attachment) =>({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType
            }))
        })

    }catch(error : any){
        console.log("Email sending error", error.message);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email")
    }
}
