"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("../entities/audit-log.entity");
let AuditService = AuditService_1 = class AuditService {
    auditLogRepository;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async logAccess(userId, action, resource, resourceId, details, metadata) {
        try {
            const auditLog = audit_log_entity_1.AuditLog.createLog(userId, this.mapStringToAuditAction(action), audit_log_entity_1.AuditResult.SUCCESS, resource, resourceId, details, metadata);
            await this.auditLogRepository.save(auditLog);
            this.logger.log(`Access granted: ${userId} ${action} ${resource} ${resourceId || ''}`);
        }
        catch (error) {
            this.logger.error('Failed to log access', error);
        }
    }
    async logAccessDenied(userId, action, resource, resourceId, reason) {
        try {
            const auditLog = audit_log_entity_1.AuditLog.createLog(userId, audit_log_entity_1.AuditAction.ACCESS_DENIED, audit_log_entity_1.AuditResult.DENIED, resource, resourceId, reason, { attemptedAction: action });
            await this.auditLogRepository.save(auditLog);
            this.logger.warn(`Access denied: ${userId} ${action} ${resource} ${resourceId || ''} - ${reason || 'Unknown reason'}`);
        }
        catch (error) {
            this.logger.error('Failed to log access denial', error);
        }
    }
    async logLogin(userId, ipAddress, userAgent) {
        try {
            const auditLog = audit_log_entity_1.AuditLog.createLog(userId, audit_log_entity_1.AuditAction.LOGIN, audit_log_entity_1.AuditResult.SUCCESS, 'user', userId, 'User logged in', { ipAddress, userAgent });
            await this.auditLogRepository.save(auditLog);
            this.logger.log(`User logged in: ${userId}`);
        }
        catch (error) {
            this.logger.error('Failed to log login', error);
        }
    }
    async logLogout(userId) {
        try {
            const auditLog = audit_log_entity_1.AuditLog.createLog(userId, audit_log_entity_1.AuditAction.LOGOUT, audit_log_entity_1.AuditResult.SUCCESS, 'user', userId, 'User logged out');
            await this.auditLogRepository.save(auditLog);
            this.logger.log(`User logged out: ${userId}`);
        }
        catch (error) {
            this.logger.error('Failed to log logout', error);
        }
    }
    async logResourceCreation(userId, resourceType, resourceId, details) {
        try {
            const auditLog = audit_log_entity_1.AuditLog.createLog(userId, audit_log_entity_1.AuditAction.CREATE, audit_log_entity_1.AuditResult.SUCCESS, resourceType, resourceId, details);
            await this.auditLogRepository.save(auditLog);
            this.logger.log(`Resource created: ${userId} created ${resourceType} ${resourceId}`);
        }
        catch (error) {
            this.logger.error('Failed to log resource creation', error);
        }
    }
    async logResourceUpdate(userId, resourceType, resourceId, details) {
        try {
            const auditLog = audit_log_entity_1.AuditLog.createLog(userId, audit_log_entity_1.AuditAction.UPDATE, audit_log_entity_1.AuditResult.SUCCESS, resourceType, resourceId, details);
            await this.auditLogRepository.save(auditLog);
            this.logger.log(`Resource updated: ${userId} updated ${resourceType} ${resourceId}`);
        }
        catch (error) {
            this.logger.error('Failed to log resource update', error);
        }
    }
    async logResourceDeletion(userId, resourceType, resourceId, details) {
        try {
            const auditLog = audit_log_entity_1.AuditLog.createLog(userId, audit_log_entity_1.AuditAction.DELETE, audit_log_entity_1.AuditResult.SUCCESS, resourceType, resourceId, details);
            await this.auditLogRepository.save(auditLog);
            this.logger.log(`Resource deleted: ${userId} deleted ${resourceType} ${resourceId}`);
        }
        catch (error) {
            this.logger.error('Failed to log resource deletion', error);
        }
    }
    async getUserAuditLogs(userId, limit = 100) {
        return this.auditLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
            relations: ['user', 'patientRecord'],
        });
    }
    async getResourceAuditLogs(resourceType, resourceId, limit = 100) {
        return this.auditLogRepository.find({
            where: { resourceType, resourceId },
            order: { createdAt: 'DESC' },
            take: limit,
            relations: ['user'],
        });
    }
    async getRecentAccessDenials(limit = 50) {
        return this.auditLogRepository.find({
            where: { action: audit_log_entity_1.AuditAction.ACCESS_DENIED },
            order: { createdAt: 'DESC' },
            take: limit,
            relations: ['user'],
        });
    }
    mapStringToAuditAction(action) {
        switch (action.toLowerCase()) {
            case 'create':
                return audit_log_entity_1.AuditAction.CREATE;
            case 'read':
                return audit_log_entity_1.AuditAction.READ;
            case 'update':
                return audit_log_entity_1.AuditAction.UPDATE;
            case 'delete':
                return audit_log_entity_1.AuditAction.DELETE;
            case 'login':
                return audit_log_entity_1.AuditAction.LOGIN;
            case 'logout':
                return audit_log_entity_1.AuditAction.LOGOUT;
            default:
                return audit_log_entity_1.AuditAction.READ;
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map