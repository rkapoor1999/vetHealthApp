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
exports.CreatePatientRecordDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreatePatientRecordDto {
    patientId;
    firstName;
    lastName;
    dateOfBirth;
    medicalHistory;
    currentTreatment;
    organizationId;
}
exports.CreatePatientRecordDto = CreatePatientRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique patient/veteran identifier',
        example: 'VET001234',
        minLength: 1,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePatientRecordDto.prototype, "patientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Patient first name',
        example: 'John',
        minLength: 1,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePatientRecordDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Patient last name',
        example: 'Doe',
        minLength: 1,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePatientRecordDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Patient date of birth (YYYY-MM-DD or ISO date string)',
        example: '1980-05-15',
        type: 'string',
        format: 'date',
    }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreatePatientRecordDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Patient medical history details',
        example: 'Veteran with PTSD and knee injury from deployment',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientRecordDto.prototype, "medicalHistory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Current treatment information',
        example: 'Physical therapy and counseling sessions',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientRecordDto.prototype, "currentTreatment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Organization ID (defaults to user organization if not provided)',
        example: '550e8400-e29b-41d4-a716-446655440000',
        format: 'uuid',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientRecordDto.prototype, "organizationId", void 0);
//# sourceMappingURL=create-patient-record.dto.js.map