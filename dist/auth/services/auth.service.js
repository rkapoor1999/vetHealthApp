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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../users/entities/user.entity");
const user_role_entity_1 = require("../../users/entities/user-role.entity");
const role_entity_1 = require("../../permissions/entities/role.entity");
const organization_entity_1 = require("../../organizations/entities/organization.entity");
const audit_service_1 = require("../../audit/services/audit.service");
let AuthService = AuthService_1 = class AuthService {
    userRepository;
    userRoleRepository;
    roleRepository;
    organizationRepository;
    jwtService;
    auditService;
    logger = new common_1.Logger(AuthService_1.name);
    defaultOrganizationId;
    constructor(userRepository, userRoleRepository, roleRepository, organizationRepository, jwtService, auditService) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }
    async onModuleInit() {
        await this.ensureDefaultOrganization();
        await this.ensureDefaultRoles();
    }
    async ensureDefaultOrganization() {
        try {
            let existingOrg = await this.organizationRepository.findOne({
                where: { name: 'Default Organization' },
            });
            if (!existingOrg) {
                existingOrg = await this.organizationRepository.save({
                    name: 'Default Organization',
                    type: organization_entity_1.OrganizationType.MEDICAL_CENTER,
                    description: 'Default organization for new users',
                    isActive: true,
                });
                this.logger.log('✅ Created default organization');
            }
            this.defaultOrganizationId = existingOrg.id;
        }
        catch (error) {
            this.logger.error('Failed to create default organization:', error);
        }
    }
    async ensureDefaultRoles() {
        try {
            const roles = [
                {
                    name: role_entity_1.RoleType.OWNER,
                    description: 'System owner with full access',
                    isActive: true,
                },
                {
                    name: role_entity_1.RoleType.ADMIN,
                    description: 'Administrator with management access',
                    isActive: true,
                },
                {
                    name: role_entity_1.RoleType.VIEWER,
                    description: 'Basic user with read-only access',
                    isActive: true,
                },
            ];
            for (const roleData of roles) {
                const existingRole = await this.roleRepository.findOne({
                    where: { name: roleData.name },
                });
                if (!existingRole) {
                    await this.roleRepository.save(roleData);
                    this.logger.log(`✅ Created role: ${roleData.name}`);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to create default roles:', error);
        }
    }
    async register(registerDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        let organizationId = registerDto.organizationId;
        if (organizationId) {
            const organization = await this.organizationRepository.findOne({
                where: { id: organizationId, isActive: true },
            });
            if (!organization) {
                organizationId = await this.getDefaultOrganizationId();
            }
        }
        else {
            organizationId = await this.getDefaultOrganizationId();
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = this.userRepository.create({
            email: registerDto.email,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            password: hashedPassword,
            organizationId: organizationId,
        });
        const savedUser = await this.userRepository.save(user);
        await this.assignDefaultRole(savedUser);
        const payload = {
            sub: savedUser.id,
            email: savedUser.email,
            organizationId: savedUser.organizationId,
        };
        const access_token = this.jwtService.sign(payload);
        this.logger.log(`✅ User registered with role: ${savedUser.email}`);
        return {
            access_token,
            user: {
                id: savedUser.id,
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                organizationId: savedUser.organizationId,
            },
        };
    }
    async assignDefaultRole(user) {
        try {
            let assignedRole;
            const userCount = await this.userRepository.count();
            const ownerExists = await this.userRoleRepository.findOne({
                relations: ['role'],
                where: {
                    role: { name: role_entity_1.RoleType.OWNER },
                    isActive: true,
                },
            });
            if (userCount === 1 || !ownerExists) {
                assignedRole = role_entity_1.RoleType.OWNER;
                this.logger.log(`👑 First user becomes OWNER: ${user.email}`);
            }
            else if (this.isAdminEmail(user.email)) {
                assignedRole = role_entity_1.RoleType.ADMIN;
                this.logger.log(`🛡️  Admin user: ${user.email}`);
            }
            else {
                assignedRole = role_entity_1.RoleType.VIEWER;
                this.logger.log(`👁️  Regular user: ${user.email}`);
            }
            const role = await this.roleRepository.findOne({
                where: { name: assignedRole, isActive: true },
            });
            if (role) {
                await this.userRoleRepository.save({
                    userId: user.id,
                    roleId: role.id,
                    organizationId: user.organizationId,
                    isActive: true,
                });
                this.logger.log(`✅ Assigned ${assignedRole} role to user: ${user.email}`);
            }
            else {
                this.logger.error(`❌ Role ${assignedRole} not found`);
            }
        }
        catch (error) {
            this.logger.error('Failed to assign default role:', error);
        }
    }
    isAdminEmail(email) {
        return (email.startsWith('admin@') ||
            email.startsWith('administrator@') ||
            email.includes('.admin@') ||
            email.includes('admin.'));
    }
    async getDefaultOrganizationId() {
        if (this.defaultOrganizationId) {
            return this.defaultOrganizationId;
        }
        let defaultOrg = await this.organizationRepository.findOne({
            where: { name: 'Default Organization' },
        });
        if (!defaultOrg) {
            defaultOrg = await this.organizationRepository.save({
                name: 'Default Organization',
                type: organization_entity_1.OrganizationType.MEDICAL_CENTER,
                description: 'Default organization for new users',
                isActive: true,
            });
            this.logger.log('Created default organization on demand');
        }
        this.defaultOrganizationId = defaultOrg.id;
        return defaultOrg.id;
    }
    async login(loginDto) {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email, isActive: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            organizationId: user.organizationId,
        };
        const access_token = this.jwtService.sign(payload);
        await this.auditService.logLogin(user.id);
        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                organizationId: user.organizationId,
            },
        };
    }
    async logout(userId) {
        await this.auditService.logLogout(userId);
    }
    async validateUser(userId) {
        return this.userRepository.findOne({
            where: { id: userId, isActive: true },
            relations: ['organization'],
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(3, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map