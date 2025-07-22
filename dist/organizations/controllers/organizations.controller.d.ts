import { OrganizationsService } from '../services/organizations.service';
export declare class OrganizationsController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationsService);
    findAll(): Promise<import("../entities/organization.entity").Organization[]>;
    findOne(id: string): Promise<import("../entities/organization.entity").Organization>;
    findDescendants(id: string): Promise<import("../entities/organization.entity").Organization[]>;
    findAncestors(id: string): Promise<import("../entities/organization.entity").Organization[]>;
}
