import { User } from '../../users/entities/user.entity';
import { PatientRecord } from '../../resources/entities/patient-record.entity';
export declare enum AuditAction {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
    ACCESS_DENIED = "access_denied",
    LOGIN = "login",
    LOGOUT = "logout"
}
export declare enum AuditResult {
    SUCCESS = "success",
    FAILURE = "failure",
    DENIED = "denied"
}
export declare class AuditLog {
    id: string;
    userId: string;
    action: AuditAction;
    result: AuditResult;
    resourceType: string;
    resourceId: string;
    patientRecordId: string;
    ipAddress: string;
    userAgent: string;
    details: string;
    metadata: string;
    user: User;
    patientRecord: PatientRecord;
    createdAt: Date;
    static createLog(userId: string, action: AuditAction, result: AuditResult, resourceType?: string, resourceId?: string, details?: string, metadata?: any): Partial<AuditLog>;
    get parsedMetadata(): any;
}
