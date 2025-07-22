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
exports.PatientRecordsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const patient_records_service_1 = require("../services/patient-records.service");
const create_patient_record_dto_1 = require("../dto/create-patient-record.dto");
const update_patient_record_dto_1 = require("../dto/update-patient-record.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const rbac_guard_1 = require("../../common/guards/rbac.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const rbac_decorator_1 = require("../../common/decorators/rbac.decorator");
let PatientRecordsController = class PatientRecordsController {
    patientRecordsService;
    constructor(patientRecordsService) {
        this.patientRecordsService = patientRecordsService;
    }
    async create(createPatientRecordDto, user) {
        if (!createPatientRecordDto.organizationId) {
            createPatientRecordDto.organizationId = user.organizationId;
        }
        return this.patientRecordsService.create(createPatientRecordDto, user.id);
    }
    async findAll(user, organizationId) {
        return this.patientRecordsService.findAll(user.id, organizationId);
    }
    async findOne(id, user) {
        return this.patientRecordsService.findOne(id, user.id);
    }
    async update(id, updatePatientRecordDto, user) {
        return this.patientRecordsService.update(id, updatePatientRecordDto, user.id);
    }
    async remove(id, user) {
        await this.patientRecordsService.remove(id, user.id);
    }
};
exports.PatientRecordsController = PatientRecordsController;
__decorate([
    (0, common_1.Post)(),
    (0, rbac_decorator_1.RequirePermission)('create', 'patient_record'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new patient record',
        description: 'Creates a new patient record with the provided information. If organizationId is not provided, uses the user\'s organization.'
    }),
    (0, swagger_1.ApiBody)({
        type: create_patient_record_dto_1.CreatePatientRecordDto,
        description: 'Patient record data',
        examples: {
            example1: {
                summary: 'Basic patient record',
                value: {
                    patientId: 'VET001234',
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: '1980-05-15',
                    medicalHistory: 'Veteran with PTSD and knee injury from deployment',
                    currentTreatment: 'Physical therapy and counseling sessions'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Patient record created successfully',
        schema: {
            example: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                patientId: 'VET001234',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1980-05-15',
                medicalHistory: 'Veteran with PTSD and knee injury from deployment',
                currentTreatment: 'Physical therapy and counseling sessions',
                status: 'active',
                organizationId: 'org-uuid-123',
                createdById: 'user-uuid-456',
                createdAt: '2025-07-21T10:30:00Z',
                updatedAt: '2025-07-21T10:30:00Z'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_patient_record_dto_1.CreatePatientRecordDto, Object]),
    __metadata("design:returntype", Promise)
], PatientRecordsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, rbac_decorator_1.RequirePermission)('read', 'patient_record'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all patient records',
        description: 'Retrieves all patient records accessible to the current user based on their role and organization'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'organizationId',
        required: false,
        description: 'Filter by specific organization (optional)',
        type: String
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Patient records retrieved successfully',
        schema: {
            type: 'array',
            example: [
                {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    patientId: 'VET001234',
                    firstName: 'John',
                    lastName: 'Doe',
                    status: 'active',
                    organizationId: 'org-uuid-123'
                }
            ]
        }
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PatientRecordsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, rbac_decorator_1.RequirePermission)('read', 'patient_record'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific patient record' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Patient record UUID',
        type: String
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Patient record retrieved successfully',
        schema: {
            example: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                patientId: 'VET001234',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1980-05-15',
                medicalHistory: 'Veteran with PTSD and knee injury from deployment',
                currentTreatment: 'Physical therapy and counseling sessions',
                status: 'active'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient record not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientRecordsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, rbac_decorator_1.RequirePermission)('update', 'patient_record'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a patient record' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Patient record UUID',
        type: String
    }),
    (0, swagger_1.ApiBody)({
        type: update_patient_record_dto_1.UpdatePatientRecordDto,
        description: 'Updated patient record data'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Patient record updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient record not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_patient_record_dto_1.UpdatePatientRecordDto, Object]),
    __metadata("design:returntype", Promise)
], PatientRecordsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, rbac_decorator_1.RequirePermission)('delete', 'patient_record'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a patient record' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Patient record UUID',
        type: String
    }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Patient record deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient record not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientRecordsController.prototype, "remove", null);
exports.PatientRecordsController = PatientRecordsController = __decorate([
    (0, swagger_1.ApiTags)('Patient Records'),
    (0, common_1.Controller)('patient-records'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [patient_records_service_1.PatientRecordsService])
], PatientRecordsController);
//# sourceMappingURL=patient-records.controller.js.map