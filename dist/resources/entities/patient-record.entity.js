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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientRecord = exports.PatientRecordStatus = void 0;
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("../../organizations/entities/organization.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const audit_log_entity_1 = require("../../audit/entities/audit-log.entity");
var PatientRecordStatus;
(function (PatientRecordStatus) {
    PatientRecordStatus["ACTIVE"] = "active";
    PatientRecordStatus["INACTIVE"] = "inactive";
    PatientRecordStatus["ARCHIVED"] = "archived";
})(PatientRecordStatus || (exports.PatientRecordStatus = PatientRecordStatus = {}));
let PatientRecord = class PatientRecord {
    id;
    patientId;
    firstName;
    lastName;
    dateOfBirth;
    medicalHistory;
    currentTreatment;
    status;
    organizationId;
    createdById;
    lastModifiedById;
    organization;
    createdBy;
    lastModifiedBy;
    auditLogs;
    createdAt;
    updatedAt;
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    get isAccessible() {
        return this.status === PatientRecordStatus.ACTIVE;
    }
};
exports.PatientRecord = PatientRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PatientRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], PatientRecord.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PatientRecord.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PatientRecord.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PatientRecord.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatientRecord.prototype, "medicalHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatientRecord.prototype, "currentTreatment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        default: PatientRecordStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], PatientRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PatientRecord.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PatientRecord.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PatientRecord.prototype, "lastModifiedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, (organization) => organization.patientRecords),
    (0, typeorm_1.JoinColumn)({ name: 'organizationId' }),
    __metadata("design:type", organization_entity_1.Organization)
], PatientRecord.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'createdById' }),
    __metadata("design:type", user_entity_1.User)
], PatientRecord.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'lastModifiedById' }),
    __metadata("design:type", user_entity_1.User)
], PatientRecord.prototype, "lastModifiedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => audit_log_entity_1.AuditLog, (auditLog) => auditLog.patientRecord),
    __metadata("design:type", Array)
], PatientRecord.prototype, "auditLogs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PatientRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PatientRecord.prototype, "updatedAt", void 0);
exports.PatientRecord = PatientRecord = __decorate([
    (0, typeorm_1.Entity)('patient_records')
], PatientRecord);
//# sourceMappingURL=patient-record.entity.js.map