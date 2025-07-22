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
exports.PatientRecordsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_record_entity_1 = require("../entities/patient-record.entity");
const rbac_service_1 = require("../../auth/services/rbac.service");
const audit_service_1 = require("../../audit/services/audit.service");
let PatientRecordsService = class PatientRecordsService {
    patientRecordRepository;
    rbacService;
    auditService;
    constructor(patientRecordRepository, rbacService, auditService) {
        this.patientRecordRepository = patientRecordRepository;
        this.rbacService = rbacService;
        this.auditService = auditService;
    }
    async create(createPatientRecordDto, userId) {
        const patientRecord = this.patientRecordRepository.create({
            ...createPatientRecordDto,
            createdById: userId,
            organizationId: createPatientRecordDto.organizationId,
        });
        const savedRecord = await this.patientRecordRepository.save(patientRecord);
        await this.auditService.logResourceCreation(userId, 'patient_record', savedRecord.id, `Created patient record for ${savedRecord.fullName}`);
        return savedRecord;
    }
    async findAll(userId, organizationId) {
        return this.rbacService.filterPatientRecords(userId, organizationId);
    }
    async findOne(id, userId) {
        const patientRecord = await this.patientRecordRepository.findOne({
            where: { id },
            relations: ['organization', 'createdBy', 'lastModifiedBy'],
        });
        if (!patientRecord) {
            throw new common_1.NotFoundException('Patient record not found');
        }
        return patientRecord;
    }
    async update(id, updatePatientRecordDto, userId) {
        const patientRecord = await this.findOne(id, userId);
        Object.assign(patientRecord, updatePatientRecordDto);
        patientRecord.lastModifiedById = userId;
        const updatedRecord = await this.patientRecordRepository.save(patientRecord);
        await this.auditService.logResourceUpdate(userId, 'patient_record', id, `Updated patient record for ${updatedRecord.fullName}`);
        return updatedRecord;
    }
    async remove(id, userId) {
        const patientRecord = await this.findOne(id, userId);
        await this.patientRecordRepository.remove(patientRecord);
        await this.auditService.logResourceDeletion(userId, 'patient_record', id, `Deleted patient record for ${patientRecord.fullName}`);
    }
};
exports.PatientRecordsService = PatientRecordsService;
exports.PatientRecordsService = PatientRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_record_entity_1.PatientRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        rbac_service_1.RbacService,
        audit_service_1.AuditService])
], PatientRecordsService);
//# sourceMappingURL=patient-records.service.js.map