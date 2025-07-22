import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';
export declare enum PatientRecordStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    ARCHIVED = "archived"
}
export declare class PatientRecord {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    medicalHistory: string;
    currentTreatment: string;
    status: PatientRecordStatus;
    organizationId: string;
    createdById: string;
    lastModifiedById: string;
    organization: Organization;
    createdBy: User;
    lastModifiedBy: User;
    auditLogs: AuditLog[];
    createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
    get isAccessible(): boolean;
}
