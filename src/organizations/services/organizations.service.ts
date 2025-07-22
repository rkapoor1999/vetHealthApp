import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: TreeRepository<Organization>,
  ) {}

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.findTrees();
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findDescendants(id: string): Promise<Organization[]> {
    const organization = await this.findOne(id);
    return this.organizationRepository.findDescendants(organization);
  }

  async findAncestors(id: string): Promise<Organization[]> {
    const organization = await this.findOne(id);
    return this.organizationRepository.findAncestors(organization);
  }
}