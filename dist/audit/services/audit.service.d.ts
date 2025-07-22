import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
export declare class AuditService {
    private auditLogRepository;
    private readonly logger;
    constructor(auditLogRepository: Repository<AuditLog>);
    logAccess(userId: string, action: string, resource: string, resourceId?: string, details?: string, metadata?: any): Promise<void>;
    logAccessDenied(userId: string, action: string, resource: string, resourceId?: string, reason?: string): Promise<void>;
    logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logLogout(userId: string): Promise<void>;
    logResourceCreation(userId: string, resourceType: string, resourceId: string, details?: string): Promise<void>;
    logResourceUpdate(userId: string, resourceType: string, resourceId: string, details?: string): Promise<void>;
    logResourceDeletion(userId: string, resourceType: string, resourceId: string, details?: string): Promise<void>;
    getUserAuditLogs(userId: string, limit?: number): Promise<AuditLog[]>;
    getResourceAuditLogs(resourceType: string, resourceId: string, limit?: number): Promise<AuditLog[]>;
    getRecentAccessDenials(limit?: number): Promise<AuditLog[]>;
    private mapStringToAuditAction;
}
