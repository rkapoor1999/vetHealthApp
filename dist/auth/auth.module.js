"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../users/entities/user.entity");
const user_role_entity_1 = require("../users/entities/user-role.entity");
const role_entity_1 = require("../permissions/entities/role.entity");
const permission_entity_1 = require("../permissions/entities/permission.entity");
const organization_entity_1 = require("../organizations/entities/organization.entity");
const patient_record_entity_1 = require("../resources/entities/patient-record.entity");
const audit_module_1 = require("../audit/audit.module");
const auth_service_1 = require("./services/auth.service");
const rbac_service_1 = require("./services/rbac.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const auth_controller_1 = require("./controllers/auth.controller");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                user_role_entity_1.UserRole,
                role_entity_1.Role,
                permission_entity_1.Permission,
                organization_entity_1.Organization,
                patient_record_entity_1.PatientRecord,
            ]),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRATION', '24h'),
                    },
                }),
            }),
            audit_module_1.AuditModule,
        ],
        providers: [auth_service_1.AuthService, rbac_service_1.RbacService, jwt_strategy_1.JwtStrategy],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, rbac_service_1.RbacService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map