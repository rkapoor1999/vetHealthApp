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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const user_role_entity_1 = require("../entities/user-role.entity");
const rbac_service_1 = require("../../auth/services/rbac.service");
let UsersService = class UsersService {
    userRepository;
    userRoleRepository;
    rbacService;
    constructor(userRepository, userRoleRepository, rbacService) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.rbacService = rbacService;
    }
    async findAll() {
        return this.userRepository.find({
            relations: ['organization', 'userRoles', 'userRoles.role'],
        });
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['organization', 'userRoles', 'userRoles.role'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getUserRoles(userId) {
        return this.userRoleRepository.find({
            where: { userId, isActive: true },
            relations: ['role', 'organization'],
        });
    }
    async assignRole(userId, roleId, organizationId) {
        const userRole = this.userRoleRepository.create({
            userId,
            roleId,
            organizationId,
        });
        return this.userRoleRepository.save(userRole);
    }
    async revokeRole(userRoleId) {
        const userRole = await this.userRoleRepository.findOne({
            where: { id: userRoleId },
        });
        if (!userRole) {
            throw new common_1.NotFoundException('User role not found');
        }
        userRole.isActive = false;
        await this.userRoleRepository.save(userRole);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        rbac_service_1.RbacService])
], UsersService);
//# sourceMappingURL=users.service.js.map