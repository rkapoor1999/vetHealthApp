import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../../auth/services/rbac.service';
export declare class RbacGuard implements CanActivate {
    private rbacService;
    private reflector;
    private readonly logger;
    constructor(rbacService: RbacService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
