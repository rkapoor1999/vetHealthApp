import { User } from './user.entity';
import { Role } from '../../permissions/entities/role.entity';
import { Organization } from '../../organizations/entities/organization.entity';
export declare class UserRole {
    id: string;
    userId: string;
    roleId: string;
    organizationId: string;
    user: User;
    role: Role;
    organization: Organization;
    expiresAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    get isValid(): boolean;
}
