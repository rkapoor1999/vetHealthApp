import { UserRole } from '../../users/entities/user-role.entity';
import { Permission } from './permission.entity';
export declare enum RoleType {
    OWNER = "owner",
    ADMIN = "admin",
    VIEWER = "viewer"
}
export declare class Role {
    id: string;
    name: RoleType;
    description: string;
    isActive: boolean;
    userRoles: UserRole[];
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
}
