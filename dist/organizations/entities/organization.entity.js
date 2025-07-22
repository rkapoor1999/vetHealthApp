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
exports.Organization = exports.OrganizationType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const patient_record_entity_1 = require("../../resources/entities/patient-record.entity");
var OrganizationType;
(function (OrganizationType) {
    OrganizationType["MEDICAL_CENTER"] = "medical_center";
    OrganizationType["DEPARTMENT"] = "department";
})(OrganizationType || (exports.OrganizationType = OrganizationType = {}));
let Organization = class Organization {
    id;
    name;
    description;
    type;
    isActive;
    parent;
    children;
    users;
    patientRecords;
    createdAt;
    updatedAt;
    get isRootOrganization() {
        return this.type === OrganizationType.MEDICAL_CENTER && !this.parent;
    }
    getFullPath() {
        if (!this.parent) {
            return this.name;
        }
        return `${this.parent.name} > ${this.name}`;
    }
};
exports.Organization = Organization;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Organization.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Organization.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Organization.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        default: OrganizationType.DEPARTMENT,
    }),
    __metadata("design:type", String)
], Organization.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Organization.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.TreeParent)(),
    __metadata("design:type", Organization)
], Organization.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.TreeChildren)(),
    __metadata("design:type", Array)
], Organization.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.organization),
    __metadata("design:type", Array)
], Organization.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => patient_record_entity_1.PatientRecord, (patientRecord) => patientRecord.organization),
    __metadata("design:type", Array)
], Organization.prototype, "patientRecords", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Organization.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Organization.prototype, "updatedAt", void 0);
exports.Organization = Organization = __decorate([
    (0, typeorm_1.Entity)('organizations'),
    (0, typeorm_1.Tree)('materialized-path')
], Organization);
//# sourceMappingURL=organization.entity.js.map