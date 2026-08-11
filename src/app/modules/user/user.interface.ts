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