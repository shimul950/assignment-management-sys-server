import { Gender } from "../../../generated/prisma/enums";

export interface ICreateAdmin {
  password: string;
  admin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
  };
}
export interface ICreateSuperAdmin {
  password: string;
  super_admin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
  };
}

export interface CreateTeacherPayload {
    password: string;
    teacher:{
        name: string;
        email: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
        experience?: number;
        gender: Gender;
        qualification: string;
        designation: string;
    }   
}