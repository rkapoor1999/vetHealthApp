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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const organizations_service_1 = require("../services/organizations.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const rbac_guard_1 = require("../../common/guards/rbac.guard");
const rbac_decorator_1 = require("../../common/decorators/rbac.decorator");
let OrganizationsController = class OrganizationsController {
    organizationsService;
    constructor(organizationsService) {
        this.organizationsService = organizationsService;
    }
    async findAll() {
        return this.organizationsService.findAll();
    }
    async findOne(id) {
        return this.organizationsService.findOne(id);
    }
    async findDescendants(id) {
        return this.organizationsService.findDescendants(id);
    }
    async findAncestors(id) {
        return this.organizationsService.findAncestors(id);
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Get)(),
    (0, rbac_decorator_1.RequirePermission)('read', 'organization'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all organizations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Organizations retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, rbac_decorator_1.RequirePermission)('read', 'organization'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Organization retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Organization not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/descendants'),
    (0, rbac_decorator_1.RequirePermission)('read', 'organization'),
    (0, swagger_1.ApiOperation)({ summary: 'Get organization descendants' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Descendants retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findDescendants", null);
__decorate([
    (0, common_1.Get)(':id/ancestors'),
    (0, rbac_decorator_1.RequirePermission)('read', 'organization'),
    (0, swagger_1.ApiOperation)({ summary: 'Get organization ancestors' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ancestors retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findAncestors", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, swagger_1.ApiTags)('Organizations'),
    (0, common_1.Controller)('organizations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map