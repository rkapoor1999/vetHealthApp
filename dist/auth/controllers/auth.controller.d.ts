import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto, AuthResult } from '../dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResult>;
    login(loginDto: LoginDto): Promise<AuthResult>;
    logout(user: any): Promise<{
        message: string;
    }>;
    getProfile(user: any): Promise<any>;
}
