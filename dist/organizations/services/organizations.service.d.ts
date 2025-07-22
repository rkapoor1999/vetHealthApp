import { TreeRepository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
export declare class OrganizationsService {
    private organizationRepository;
    constructor(organizationRepository: TreeRepository<Organization>);
    findAll(): Promise<Organization[]>;
    findOne(id: string): Promise<Organization>;
    findDescendants(id: string): Promise<Organization[]>;
    findAncestors(id: string): Promise<Organization[]>;
}
