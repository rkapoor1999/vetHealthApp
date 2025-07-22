import { UserRole } from './user-role.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';
export declare class User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    isActive: boolean;
    organizationId: string;
    organization: Organization;
    userRoles: UserRole[];
    auditLogs: AuditLog[];
    createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
}
