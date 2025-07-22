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
var RbacService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const user_role_entity_1 = require("../../users/entities/user-role.entity");
const role_entity_1 = require("../../permissions/entities/role.entity");
const permission_entity_1 = require("../../permissions/entities/permission.entity");
const organization_entity_1 = require("../../organizations/entities/organization.entity");
const patient_record_entity_1 = require("../../resources/entities/patient-record.entity");
const audit_service_1 = require("../../audit/services/audit.service");
let RbacService = RbacService_1 = class RbacService {
    userRepository;
    userRoleRepository;
    roleRepository;
    permissionRepository;
    organizationRepository;
    patientRecordRepository;
    auditService;
    logger = new common_1.Logger(RbacService_1.name);
    rolePermissions = {
        [role_entity_1.RoleType.OWNER]: [
            'create:*',
            'read:*',
            'update:*',
            'delete:*',
        ],
        [role_entity_1.RoleType.ADMIN]: [
            'create:patient_record',
            'read:patient_record',
            'update:patient_record',
            'delete:patient_record',
            'read:user',
            'create:user',
            'update:user',
            'read:organization',
            'read:permission',
        ],
        [role_entity_1.RoleType.VIEWER]: [
            'read:patient_record',
            'read:user',
        ],
    };
    constructor(userRepository, userRoleRepository, roleRepository, permissionRepository, organizationRepository, patientRecordRepository, auditService) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.organizationRepository = organizationRepository;
        this.patientRecordRepository = patientRecordRepository;
        this.auditService = auditService;
    }
    async hasAccess(context) {
        try {
            const user = await this.getUserWithRoles(context.userId);
            if (!user) {
                return { granted: false, reason: 'User not found' };
            }
            const userPermissions = await this.getUserPermissions(context.userId, context.organizationId);
            const hasPermission = this.checkPermission(userPermissions, context.action, context.resource);
            if (!hasPermission) {
                await this.auditService.logAccessDenied(context.userId, context.action, context.resource, context.resourceId);
                return { granted: false, reason: 'Insufficient permissions' };
            }
            if (context.resourceId) {
                const resourceAccess = await this.checkResourceAccess(context);
                if (!resourceAccess.granted) {
                    await this.auditService.logAccessDenied(context.userId, context.action, context.resource, context.resourceId);
                    return resourceAccess;
                }
            }
            await this.auditService.logAccess(context.userId, context.action, context.resource, context.resourceId);
            return { granted: true };
        }
        catch (error) {
            this.logger.error('Error checking access', error);
            return { granted: false, reason: 'Internal error' };
        }
    }
    async getUserWithRoles(userId) {
        return this.userRepository.findOne({
            where: { id: userId },
            relations: ['userRoles', 'userRoles.role', 'userRoles.organization', 'organization'],
        });
    }
    async getUserPermissions(userId, organizationId) {
        const userRoles = await this.userRoleRepository.find({
            where: {
                userId,
                isActive: true,
            },
            relations: ['role', 'organization'],
        });
        this.logger.debug(`User ${userId} roles found:`, userRoles.map(ur => ({
            roleName: ur.role?.name,
            organizationId: ur.organizationId,
            organizationName: ur.organization?.name,
            isValid: ur.isValid
        })));
        const permissions = new Set();
        for (const userRole of userRoles) {
            if (!userRole.isValid)
                continue;
            if (userRole.role.name === role_entity_1.RoleType.OWNER ||
                !organizationId ||
                userRole.organizationId === organizationId ||
                await this.hasOrganizationalAccess(userRole.organizationId, organizationId)) {
                const rolePermissions = this.getRolePermissions(userRole.role.name);
                this.logger.debug(`Adding permissions for role ${userRole.role.name}:`, rolePermissions);
                rolePermissions.forEach(perm => permissions.add(perm));
            }
        }
        const permissionArray = Array.from(permissions);
        this.logger.debug(`User ${userId} permissions:`, permissionArray);
        return permissionArray;
    }
    async hasOrganizationalAccess(userOrgId, targetOrgId) {
        if (userOrgId === targetOrgId)
            return true;
        const targetOrg = await this.organizationRepository.findOne({
            where: { id: targetOrgId },
            relations: ['parent'],
        });
        return targetOrg?.parent?.id === userOrgId;
    }
    getRolePermissions(roleName) {
        return this.rolePermissions[roleName] || [];
    }
    checkPermission(userPermissions, action, resource) {
        const requiredPermission = `${action}:${resource}`;
        const wildcardAction = `${action}:*`;
        const wildcardResource = `*:${resource}`;
        const fullWildcard = '*:*';
        const hasPermission = userPermissions.includes(requiredPermission) ||
            userPermissions.includes(wildcardAction) ||
            userPermissions.includes(wildcardResource) ||
            userPermissions.includes(fullWildcard);
        this.logger.debug(`Checking permission: ${requiredPermission}`, {
            userPermissions,
            hasPermission,
        });
        return hasPermission;
    }
    async checkResourceAccess(context) {
        if (context.resource === 'patient_record' && context.resourceId) {
            return this.checkPatientRecordAccess(context);
        }
        return { granted: true };
    }
    async checkPatientRecordAccess(context) {
        const patientRecord = await this.patientRecordRepository.findOne({
            where: { id: context.resourceId },
            relations: ['organization', 'organization.parent'],
        });
        if (!patientRecord) {
            return { granted: false, reason: 'Patient record not found' };
        }
        const user = await this.getUserWithRoles(context.userId);
        if (!user) {
            return { granted: false, reason: 'User not found' };
        }
        const userOrganizations = await this.getUserOrganizations(context.userId);
        const hasOrganizationalAccess = this.checkOrganizationalAccess(userOrganizations, patientRecord.organization);
        if (!hasOrganizationalAccess) {
            return { granted: false, reason: 'No organizational access to this patient record' };
        }
        return { granted: true };
    }
    async getUserOrganizations(userId) {
        const userRoles = await this.userRoleRepository.find({
            where: { userId, isActive: true },
            relations: ['organization', 'organization.parent'],
        });
        const organizations = new Set();
        for (const userRole of userRoles) {
            if (!userRole.isValid)
                continue;
            organizations.add(userRole.organization);
            if (userRole.organization.parent) {
                organizations.add(userRole.organization.parent);
            }
        }
        return Array.from(organizations);
    }
    checkOrganizationalAccess(userOrganizations, resourceOrganization) {
        if (userOrganizations.some(org => org.id === resourceOrganization.id)) {
            return true;
        }
        if (resourceOrganization.parent) {
            return userOrganizations.some(org => org.id === resourceOrganization.parent.id);
        }
        return false;
    }
    async filterPatientRecords(userId, organizationId) {
        const userOrganizations = await this.getUserOrganizations(userId);
        const organizationIds = userOrganizations.map(org => org.id);
        if (organizationIds.length === 0) {
            return [];
        }
        const queryBuilder = this.patientRecordRepository.createQueryBuilder('patient_record')
            .leftJoinAndSelect('patient_record.organization', 'organization')
            .where('patient_record.organizationId IN (:...organizationIds)', { organizationIds });
        if (organizationId) {
            queryBuilder.andWhere('patient_record.organizationId = :organizationId', { organizationId });
        }
        return queryBuilder.getMany();
    }
    async hasAnyRole(userId) {
        const count = await this.userRoleRepository.count({
            where: { userId, isActive: true },
        });
        return count > 0;
    }
    async getUserRoles(userId) {
        const userRoles = await this.userRoleRepository.find({
            where: { userId, isActive: true },
            relations: ['role'],
        });
        return userRoles
            .filter(ur => ur.isValid)
            .map(ur => ur.role.name);
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = RbacService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(3, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(4, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(5, (0, typeorm_1.InjectRepository)(patient_record_entity_1.PatientRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], RbacService);
//# sourceMappingURL=rbac.service.js.map