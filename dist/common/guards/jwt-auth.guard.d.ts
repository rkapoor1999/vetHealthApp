import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../../auth/services/rbac.service';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private reflector;
    private rbacService;
    private readonly logger;
    constructor(reflector: Reflector, rbacService: RbacService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private isSystemEndpoint;
    private extractResourceFromPath;
    private mapMethodToAction;
    handleRequest(err: any, user: any, info: any, context: ExecutionContext): any;
}
export {};
