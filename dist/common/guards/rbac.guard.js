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
var RbacGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rbac_service_1 = require("../../auth/services/rbac.service");
const rbac_decorator_1 = require("../decorators/rbac.decorator");
let RbacGuard = RbacGuard_1 = class RbacGuard {
    rbacService;
    reflector;
    logger = new common_1.Logger(RbacGuard_1.name);
    constructor(rbacService, reflector) {
        this.rbacService = rbacService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const rbacRequirement = this.reflector.getAllAndOverride(rbac_decorator_1.RBAC_KEY, [context.getHandler(), context.getClass()]);
        if (!rbacRequirement) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.warn('No user found in request');
            return false;
        }
        const resourceId = request.params.id || request.body.id;
        const organizationId = request.params.organizationId || request.body.organizationId;
        const accessContext = {
            userId: user.id,
            organizationId: organizationId || user.organizationId,
            action: rbacRequirement.action,
            resource: rbacRequirement.resource,
            resourceId,
        };
        try {
            const accessResult = await this.rbacService.hasAccess(accessContext);
            if (!accessResult.granted) {
                this.logger.warn(`Access denied for user ${user.id}: ${accessResult.reason}`);
                throw new common_1.ForbiddenException(accessResult.reason || 'Access denied');
            }
            return true;
        }
        catch (error) {
            this.logger.error('Error in RBAC guard', error);
            throw new common_1.ForbiddenException('Access denied');
        }
    }
};
exports.RbacGuard = RbacGuard;
exports.RbacGuard = RbacGuard = RbacGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rbac_service_1.RbacService,
        core_1.Reflector])
], RbacGuard);
//# sourceMappingURL=rbac.guard.js.map