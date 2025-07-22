import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { RbacService } from '../../auth/services/rbac.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private rbacService: RbacService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['organization', 'userRoles', 'userRoles.role'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['organization', 'userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { userId, isActive: true },
      relations: ['role', 'organization'],
    });
  }

  async assignRole(
    userId: string,
    roleId: string,
    organizationId: string,
  ): Promise<UserRole> {
    const userRole = this.userRoleRepository.create({
      userId,
      roleId,
      organizationId,
    });

    return this.userRoleRepository.save(userRole);
  }

  async revokeRole(userRoleId: string): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { id: userRoleId },
    });

    if (!userRole) {
      throw new NotFoundException('User role not found');
    }

    userRole.isActive = false;
    await this.userRoleRepository.save(userRole);
  }
}