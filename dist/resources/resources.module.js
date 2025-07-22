"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const patient_record_entity_1 = require("./entities/patient-record.entity");
const patient_records_service_1 = require("./services/patient-records.service");
const patient_records_controller_1 = require("./controllers/patient-records.controller");
const auth_module_1 = require("../auth/auth.module");
const audit_module_1 = require("../audit/audit.module");
let ResourcesModule = class ResourcesModule {
};
exports.ResourcesModule = ResourcesModule;
exports.ResourcesModule = ResourcesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([patient_record_entity_1.PatientRecord]),
            auth_module_1.AuthModule,
            audit_module_1.AuditModule,
        ],
        controllers: [patient_records_controller_1.PatientRecordsController],
        providers: [patient_records_service_1.PatientRecordsService],
        exports: [patient_records_service_1.PatientRecordsService],
    })
], ResourcesModule);
//# sourceMappingURL=resources.module.js.map