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
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
const rbac_service_1 = require("../../auth/services/rbac.service");
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    reflector;
    rbacService;
    logger = new common_1.Logger(JwtAuthGuard_1.name);
    constructor(reflector, rbacService) {
        super();
        this.reflector = reflector;
        this.rbacService = rbacService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const isAuthenticated = await super.canActivate(context);
        if (!isAuthenticated) {
            return false;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (this.isSystemEndpoint(request.url)) {
            return true;
        }
        const hasRoles = await this.rbacService.hasAnyRole(user.id);
        if (!hasRoles) {
            this.logger.warn(`User ${user.email} has no roles assigned`);
            return false;
        }
        const action = this.mapMethodToAction(request.method);
        const resource = this.extractResourceFromPath(request.route?.path || request.url);
        const accessResult = await this.rbacService.hasAccess({
            userId: user.id,
            action,
            resource,
            organizationId: user.organizationId,
        });
        if (!accessResult.granted) {
            this.logger.warn(`Access denied for user ${user.email}: ${accessResult.reason}`);
            return false;
        }
        return true;
    }
    isSystemEndpoint(url) {
        const systemPaths = [
            '/api/health',
            '/api/docs',
            '/',
            '/api',
        ];
        return systemPaths.some(path => url === path || url.startsWith(path));
    }
    extractResourceFromPath(path) {
        const segments = path
            .replace('/api/', '')
            .split('/')
            .filter(segment => segment && !segment.startsWith(':'));
        const resource = segments[0] || 'unknown';
        const resourceMap = {
            'users': 'user',
            'patient-records': 'patient_record',
            'organizations': 'organization',
            'permissions': 'permission',
            'roles': 'role',
            'auth': 'auth',
        };
        return resourceMap[resource] || resource;
    }
    mapMethodToAction(method) {
        const actionMap = {
            'GET': 'read',
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete',
        };
        return actionMap[method?.toUpperCase()] || 'read';
    }
    handleRequest(err, user, info, context) {
        if (err || !user) {
            throw err || new common_1.UnauthorizedException('Invalid or expired token');
        }
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        rbac_service_1.RbacService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map