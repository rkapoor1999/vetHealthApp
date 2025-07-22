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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_entity_1 = require("../entities/organization.entity");
let OrganizationsService = class OrganizationsService {
    organizationRepository;
    constructor(organizationRepository) {
        this.organizationRepository = organizationRepository;
    }
    async findAll() {
        return this.organizationRepository.findTrees();
    }
    async findOne(id) {
        const organization = await this.organizationRepository.findOne({
            where: { id },
            relations: ['parent', 'children'],
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return organization;
    }
    async findDescendants(id) {
        const organization = await this.findOne(id);
        return this.organizationRepository.findDescendants(organization);
    }
    async findAncestors(id) {
        const organization = await this.findOne(id);
        return this.organizationRepository.findAncestors(organization);
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __metadata("design:paramtypes", [typeorm_2.TreeRepository])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map