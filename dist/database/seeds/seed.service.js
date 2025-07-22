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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const role_entity_1 = require("../../permissions/entities/role.entity");
const permission_entity_1 = require("../../permissions/entities/permission.entity");
const organization_entity_1 = require("../../organizations/entities/organization.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const user_role_entity_1 = require("../../users/entities/user-role.entity");
let SeedService = SeedService_1 = class SeedService {
    roleRepository;
    permissionRepository;
    organizationRepository;
    userRepository;
    userRoleRepository;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(roleRepository, permissionRepository, organizationRepository, userRepository, userRoleRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
    }
    async seed() {
        this.logger.log('Starting database seeding...');
        try {
            const permissions = await this.createPermissions();
            this.logger.log(`Created ${permissions.length} permissions`);
            const roles = await this.createRoles();
            this.logger.log(`Created ${roles.length} roles`);
            await this.assignPermissionsToRoles(roles, permissions);
            this.logger.log('Assigned permissions to roles');
            const organizations = await this.createOrganizations();
            this.logger.log(`Created ${organizations.length} organizations`);
            const users = await this.createDefaultUsers(organizations);
            this.logger.log(`Created ${users.length} default users`);
            await this.assignRolesToUsers(users, roles, organizations);
            this.logger.log('Assigned roles to users');
            this.logger.log('Database seeding completed successfully!');
        }
        catch (error) {
            this.logger.error('Database seeding failed:', error);
            throw error;
        }
    }
    async createPermissions() {
        const permissionData = [
            { action: permission_entity_1.PermissionAction.CREATE, resource: permission_entity_1.ResourceType.PATIENT_RECORD, description: 'Create patient records' },
            { action: permission_entity_1.PermissionAction.READ, resource: permission_entity_1.ResourceType.PATIENT_RECORD, description: 'Read patient records' },
            { action: permission_entity_1.PermissionAction.UPDATE, resource: permission_entity_1.ResourceType.PATIENT_RECORD, description: 'Update patient records' },
            { action: permission_entity_1.PermissionAction.DELETE, resource: permission_entity_1.ResourceType.PATIENT_RECORD, description: 'Delete patient records' },
            { action: permission_entity_1.PermissionAction.CREATE, resource: permission_entity_1.ResourceType.USER, description: 'Create users' },
            { action: permission_entity_1.PermissionAction.READ, resource: permission_entity_1.ResourceType.USER, description: 'Read users' },
            { action: permission_entity_1.PermissionAction.UPDATE, resource: permission_entity_1.ResourceType.USER, description: 'Update users' },
            { action: permission_entity_1.PermissionAction.DELETE, resource: permission_entity_1.ResourceType.USER, description: 'Delete users' },
            { action: permission_entity_1.PermissionAction.CREATE, resource: permission_entity_1.ResourceType.ORGANIZATION, description: 'Create organizations' },
            { action: permission_entity_1.PermissionAction.READ, resource: permission_entity_1.ResourceType.ORGANIZATION, description: 'Read organizations' },
            { action: permission_entity_1.PermissionAction.UPDATE, resource: permission_entity_1.ResourceType.ORGANIZATION, description: 'Update organizations' },
            { action: permission_entity_1.PermissionAction.DELETE, resource: permission_entity_1.ResourceType.ORGANIZATION, description: 'Delete organizations' },
        ];
        const permissions = [];
        for (const permData of permissionData) {
            const existingPermission = await this.permissionRepository.findOne({
                where: { action: permData.action, resource: permData.resource },
            });
            if (!existingPermission) {
                const permission = this.permissionRepository.create(permData);
                permissions.push(await this.permissionRepository.save(permission));
            }
            else {
                permissions.push(existingPermission);
            }
        }
        return permissions;
    }
    async createRoles() {
        const roleData = [
            { name: role_entity_1.RoleType.OWNER, description: 'System owner with full access', priority: 100 },
            { name: role_entity_1.RoleType.ADMIN, description: 'Administrator with management access', priority: 50 },
            { name: role_entity_1.RoleType.VIEWER, description: 'Viewer with read-only access', priority: 10 },
        ];
        const roles = [];
        for (const roleDataItem of roleData) {
            const existingRole = await this.roleRepository.findOne({
                where: { name: roleDataItem.name },
            });
            if (!existingRole) {
                const role = this.roleRepository.create(roleDataItem);
                roles.push(await this.roleRepository.save(role));
            }
            else {
                roles.push(existingRole);
            }
        }
        return roles;
    }
    async assignPermissionsToRoles(roles, permissions) {
        const rolePermissionMap = {
            [role_entity_1.RoleType.OWNER]: [
                'create:patient_record', 'read:patient_record', 'update:patient_record', 'delete:patient_record',
                'create:user', 'read:user', 'update:user', 'delete:user',
                'create:organization', 'read:organization', 'update:organization', 'delete:organization',
            ],
            [role_entity_1.RoleType.ADMIN]: [
                'create:patient_record', 'read:patient_record', 'update:patient_record',
                'read:user', 'update:user',
                'read:organization',
            ],
            [role_entity_1.RoleType.VIEWER]: [
                'read:patient_record',
                'read:user',
                'read:organization',
            ],
        };
        for (const role of roles) {
            const permissionStrings = rolePermissionMap[role.name];
            const rolePermissions = permissions.filter(permission => permissionStrings.includes(permission.permissionString));
            if (rolePermissions.length > 0) {
                role.permissions = rolePermissions;
                await this.roleRepository.save(role);
            }
        }
    }
    async createOrganizations() {
        const organizationData = [
            { name: 'VA Medical Center - Phoenix', type: organization_entity_1.OrganizationType.MEDICAL_CENTER, description: 'Main VA Medical Center in Phoenix' },
            { name: 'Cardiology Department', type: organization_entity_1.OrganizationType.DEPARTMENT, description: 'Cardiology Department' },
            { name: 'Neurology Department', type: organization_entity_1.OrganizationType.DEPARTMENT, description: 'Neurology Department' },
            { name: 'Emergency Department', type: organization_entity_1.OrganizationType.DEPARTMENT, description: 'Emergency Department' },
        ];
        const organizations = [];
        const medicalCenter = await this.organizationRepository.findOne({
            where: { name: organizationData[0].name },
        });
        let savedMedicalCenter;
        if (!medicalCenter) {
            savedMedicalCenter = await this.organizationRepository.save(this.organizationRepository.create(organizationData[0]));
        }
        else {
            savedMedicalCenter = medicalCenter;
        }
        organizations.push(savedMedicalCenter);
        for (let i = 1; i < organizationData.length; i++) {
            const existingDepartment = await this.organizationRepository.findOne({
                where: { name: organizationData[i].name },
            });
            if (!existingDepartment) {
                const department = this.organizationRepository.create({
                    ...organizationData[i],
                    parent: savedMedicalCenter,
                });
                organizations.push(await this.organizationRepository.save(department));
            }
            else {
                organizations.push(existingDepartment);
            }
        }
        return organizations;
    }
    async createDefaultUsers(organizations) {
        const medicalCenter = organizations.find(org => org.type === organization_entity_1.OrganizationType.MEDICAL_CENTER);
        const departments = organizations.filter(org => org.type === organization_entity_1.OrganizationType.DEPARTMENT);
        if (!medicalCenter) {
            throw new Error('Medical center not found in organizations');
        }
        const hashedPassword = await bcrypt.hash('DefaultPassword123!', 10);
        const userData = [
            {
                email: 'owner@va.gov',
                firstName: 'System',
                lastName: 'Owner',
                password: hashedPassword,
                organizationId: medicalCenter.id,
                isActive: true,
            },
            {
                email: 'admin@va.gov',
                firstName: 'Department',
                lastName: 'Admin',
                password: hashedPassword,
                organizationId: departments[0].id,
                isActive: true,
            },
            {
                email: 'viewer@va.gov',
                firstName: 'Medical',
                lastName: 'Viewer',
                password: hashedPassword,
                organizationId: departments[1].id,
                isActive: true,
            },
        ];
        const users = [];
        for (const userDataItem of userData) {
            const existingUser = await this.userRepository.findOne({
                where: { email: userDataItem.email },
            });
            if (!existingUser) {
                const user = this.userRepository.create(userDataItem);
                users.push(await this.userRepository.save(user));
            }
            else {
                users.push(existingUser);
            }
        }
        return users;
    }
    async assignRolesToUsers(users, roles, organizations) {
        const userRoleAssignments = [
            { userEmail: 'owner@va.gov', roleName: role_entity_1.RoleType.OWNER },
            { userEmail: 'admin@va.gov', roleName: role_entity_1.RoleType.ADMIN },
            { userEmail: 'viewer@va.gov', roleName: role_entity_1.RoleType.VIEWER },
        ];
        for (const assignment of userRoleAssignments) {
            const user = users.find(u => u.email === assignment.userEmail);
            const role = roles.find(r => r.name === assignment.roleName);
            if (user && role) {
                const existingUserRole = await this.userRoleRepository.findOne({
                    where: { userId: user.id, roleId: role.id, organizationId: user.organizationId },
                });
                if (!existingUserRole) {
                    const userRole = this.userRoleRepository.create({
                        userId: user.id,
                        roleId: role.id,
                        organizationId: user.organizationId,
                        isActive: true,
                    });
                    await this.userRoleRepository.save(userRole);
                }
            }
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(2, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map