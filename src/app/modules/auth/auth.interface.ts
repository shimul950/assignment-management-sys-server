export interface RegisterStudentPayload {
    name: string,
    email: string,
    password: string
}

export interface LoginUserPayload {
    email: string,
    password: string
}

export interface IChangePasswordPayload{
    currentPassword: string,
    newPassword: string
}

export interface ISessionPayload {
    session: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date;
        token: string;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    };
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
        role: string;
        status: string;
        isDeleted: boolean;
        needPasswordChange: boolean;
        deletedAt?: Date | null | undefined;
    };
} 