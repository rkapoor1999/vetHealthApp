export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto extends LoginDto {
    firstName: string;
    lastName: string;
    organizationId?: string;
}
export interface AuthResult {
    access_token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        organizationId: string;
    };
}
