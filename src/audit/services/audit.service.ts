import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditResult } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log successful access
   */
  async logAccess(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: string,
    metadata?: any,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.createLog(
        userId,
        this.mapStringToAuditAction(action),
        AuditResult.SUCCESS,
        resource,
        resourceId,
        details,
        metadata,
      );

      await this.auditLogRepository.save(auditLog);
      this.logger.log(`Access granted: ${userId} ${action} ${resource} ${resourceId || ''}`);
    } catch (error) {
      this.logger.error('Failed to log access', error);
    }
  }

  /**
   * Log access denial
   */
  async logAccessDenied(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    reason?: string,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.createLog(
        userId,
        AuditAction.ACCESS_DENIED,
        AuditResult.DENIED,
        resource,
        resourceId,
        reason,
        { attemptedAction: action },
      );

      await this.auditLogRepository.save(auditLog);
      this.logger.warn(`Access denied: ${userId} ${action} ${resource} ${resourceId || ''} - ${reason || 'Unknown reason'}`);
    } catch (error) {
      this.logger.error('Failed to log access denial', error);
    }
  }

  /**
   * Log user login
   */
  async logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      const auditLog = AuditLog.createLog(
        userId,
        AuditAction.LOGIN,
        AuditResult.SUCCESS,
        'user',
        userId,
        'User logged in',
        { ipAddress, userAgent },
      );

      await this.auditLogRepository.save(auditLog);
      this.logger.log(`User logged in: ${userId}`);
    } catch (error) {
      this.logger.error('Failed to log login', error);
    }
  }

  /**
   * Log user logout
   */
  async logLogout(userId: string): Promise<void> {
    try {
      const auditLog = AuditLog.createLog(
        userId,
        AuditAction.LOGOUT,
        AuditResult.SUCCESS,
        'user',
        userId,
        'User logged out',
      );

      await this.auditLogRepository.save(auditLog);
      this.logger.log(`User logged out: ${userId}`);
    } catch (error) {
      this.logger.error('Failed to log logout', error);
    }
  }

  /**
   * Log resource creation
   */
  async logResourceCreation(
    userId: string,
    resourceType: string,
    resourceId: string,
    details?: string,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.createLog(
        userId,
        AuditAction.CREATE,
        AuditResult.SUCCESS,
        resourceType,
        resourceId,
        details,
      );

      await this.auditLogRepository.save(auditLog);
      this.logger.log(`Resource created: ${userId} created ${resourceType} ${resourceId}`);
    } catch (error) {
      this.logger.error('Failed to log resource creation', error);
    }
  }

  /**
   * Log resource update
   */
  async logResourceUpdate(
    userId: string,
    resourceType: string,
    resourceId: string,
    details?: string,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.createLog(
        userId,
        AuditAction.UPDATE,
        AuditResult.SUCCESS,
        resourceType,
        resourceId,
        details,
      );

      await this.auditLogRepository.save(auditLog);
      this.logger.log(`Resource updated: ${userId} updated ${resourceType} ${resourceId}`);
    } catch (error) {
      this.logger.error('Failed to log resource update', error);
    }
  }

  /**
   * Log resource deletion
   */
  async logResourceDeletion(
    userId: string,
    resourceType: string,
    resourceId: string,
    details?: string,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.createLog(
        userId,
        AuditAction.DELETE,
        AuditResult.SUCCESS,
        resourceType,
        resourceId,
        details,
      );

      await this.auditLogRepository.save(auditLog);
      this.logger.log(`Resource deleted: ${userId} deleted ${resourceType} ${resourceId}`);
    } catch (error) {
      this.logger.error('Failed to log resource deletion', error);
    }
  }

  /**
   * Get audit logs for a user
   */
  async getUserAuditLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user', 'patientRecord'],
    });
  }

  /**
   * Get audit logs for a resource
   */
  async getResourceAuditLogs(resourceType: string, resourceId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { resourceType, resourceId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  /**
   * Get recent access denied attempts
   */
  async getRecentAccessDenials(limit: number = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { action: AuditAction.ACCESS_DENIED },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  /**
   * Helper method to map string action to AuditAction enum
   */
  private mapStringToAuditAction(action: string): AuditAction {
    switch (action.toLowerCase()) {
      case 'create':
        return AuditAction.CREATE;
      case 'read':
        return AuditAction.READ;
      case 'update':
        return AuditAction.UPDATE;
      case 'delete':
        return AuditAction.DELETE;
      case 'login':
        return AuditAction.LOGIN;
      case 'logout':
        return AuditAction.LOGOUT;
      default:
        return AuditAction.READ; // Default to read for unknown actions
    }
  }
}