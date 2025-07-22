import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { Role, RoleType } from '../../permissions/entities/role.entity';
import { Permission, PermissionAction, ResourceType } from '../../permissions/entities/permission.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { PatientRecord } from '../../resources/entities/patient-record.entity';
import { AuditService } from '../../audit/services/audit.service';
import { AccessContext, AccessResult } from '../../common/interfaces/rbac.interface';

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);
  
  // Define exactly what each of the 3 roles can do
  private readonly rolePermissions: Record<RoleType, string[]> = {
    [RoleType.OWNER]: [
      // OWNER can do everything
      'create:*',
      'read:*',
      'update:*', 
      'delete:*',
    ],
    [RoleType.ADMIN]: [
      // ADMIN can manage patient records and users
      'create:patient_record',
      'read:patient_record',
      'update:patient_record',
      'delete:patient_record',
      'read:user',
      'create:user',
      'update:user',
      'read:organization',
      'read:permission',
    ],
    [RoleType.VIEWER]: [
      // VIEWER can only read patient records
      'read:patient_record',
      'read:user',
    ],
  };

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(PatientRecord)
    private patientRecordRepository: Repository<PatientRecord>,
    private auditService: AuditService,
  ) {}

  /**
   * Main access control method
   */
  async hasAccess(context: AccessContext): Promise<AccessResult> {
    try {
      const user = await this.getUserWithRoles(context.userId);
      if (!user) {
        return { granted: false, reason: 'User not found' };
      }

      // Get user's effective permissions
      const userPermissions = await this.getUserPermissions(context.userId, context.organizationId);
      
      // Check if user has required permission
      const hasPermission = this.checkPermission(userPermissions, context.action, context.resource);
      
      if (!hasPermission) {
        await this.auditService.logAccessDenied(context.userId, context.action, context.resource, context.resourceId);
        return { granted: false, reason: 'Insufficient permissions' };
      }

      // Additional resource-specific checks
      if (context.resourceId) {
        const resourceAccess = await this.checkResourceAccess(context);
        if (!resourceAccess.granted) {
          await this.auditService.logAccessDenied(context.userId, context.action, context.resource, context.resourceId);
          return resourceAccess;
        }
      }

      // Log successful access
      await this.auditService.logAccess(context.userId, context.action, context.resource, context.resourceId);
      
      return { granted: true };
    } catch (error) {
      this.logger.error('Error checking access', error);
      return { granted: false, reason: 'Internal error' };
    }
  }

  /**
   * Get user with all roles and organizations
   */
  private async getUserWithRoles(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role', 'userRoles.organization', 'organization'],
    });
  }

  /**
   * Get all effective permissions for a user
   */
  async getUserPermissions(userId: string, organizationId?: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { 
        userId,
        isActive: true,
        //...(organizationId && { organizationId }),
      },
      relations: ['role', 'organization'],
    });

    // logging
    this.logger.debug(`User ${userId} roles found:`, userRoles.map(ur => ({
      roleName: ur.role?.name,
      organizationId: ur.organizationId,
      organizationName: ur.organization?.name,
      isValid: ur.isValid
    })));

    const permissions = new Set<string>();
    
    for (const userRole of userRoles) {
      if (!userRole.isValid) continue;
      
      // For OWNER role, grant access across all organizations
      // For other roles, check organizational context
      if (userRole.role.name === RoleType.OWNER || 
          !organizationId || 
          userRole.organizationId === organizationId ||
          await this.hasOrganizationalAccess(userRole.organizationId, organizationId)) {
        
        const rolePermissions = this.getRolePermissions(userRole.role.name as RoleType);
        this.logger.debug(`Adding permissions for role ${userRole.role.name}:`, rolePermissions);
        rolePermissions.forEach(perm => permissions.add(perm));
      }
    }

    const permissionArray = Array.from(permissions);
    this.logger.debug(`User ${userId} permissions:`, permissionArray);
    
    return permissionArray;
  }

  /*
   Check if user's organization has access to target organization
   */
  private async hasOrganizationalAccess(userOrgId: string, targetOrgId: string): Promise<boolean> {
    if (userOrgId === targetOrgId) return true;
    
    // Check if user's org is parent of target org
    const targetOrg = await this.organizationRepository.findOne({
      where: { id: targetOrgId },
      relations: ['parent'],
    });
    
    return targetOrg?.parent?.id === userOrgId;
  }

  /**
   * Get permissions for a specific role
   */
  private getRolePermissions(roleName: RoleType): string[] {
    return this.rolePermissions[roleName] || [];
  }

  /**
   * Check if user has specific permission
   */
  private checkPermission(userPermissions: string[], action: string, resource: string): boolean {
    const requiredPermission = `${action}:${resource}`;
    const wildcardAction = `${action}:*`;
    const wildcardResource = `*:${resource}`;
    const fullWildcard = '*:*';
    
    const hasPermission = userPermissions.includes(requiredPermission) || 
                         userPermissions.includes(wildcardAction) ||
                         userPermissions.includes(wildcardResource) ||
                         userPermissions.includes(fullWildcard);

    this.logger.debug(`Checking permission: ${requiredPermission}`, {
      userPermissions,
      hasPermission,
    });

    return hasPermission;
  }

  /**
   * Check access to specific resource (e.g., patient record)
   */
  private async checkResourceAccess(context: AccessContext): Promise<AccessResult> {
    if (context.resource === 'patient_record' && context.resourceId) {
      return this.checkPatientRecordAccess(context);
    }
    
    return { granted: true };
  }

  /**
   * Check access to patient record with organizational hierarchy
   */
  private async checkPatientRecordAccess(context: AccessContext): Promise<AccessResult> {
    const patientRecord = await this.patientRecordRepository.findOne({
      where: { id: context.resourceId },
      relations: ['organization', 'organization.parent'],
    });

    if (!patientRecord) {
      return { granted: false, reason: 'Patient record not found' };
    }

    const user = await this.getUserWithRoles(context.userId);
    if (!user) {
      return { granted: false, reason: 'User not found' };
    }

    // Check if user has access through organization hierarchy
    const userOrganizations = await this.getUserOrganizations(context.userId);
    const hasOrganizationalAccess = this.checkOrganizationalAccess(
      userOrganizations,
      patientRecord.organization,
    );

    if (!hasOrganizationalAccess) {
      return { granted: false, reason: 'No organizational access to this patient record' };
    }

    return { granted: true };
  }

  /**
   * Get all organizations user has access to
   */
  private async getUserOrganizations(userId: string): Promise<Organization[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId, isActive: true },
      relations: ['organization', 'organization.parent'],
    });

    const organizations = new Set<Organization>();
    
    for (const userRole of userRoles) {
      if (!userRole.isValid) continue;
      
      organizations.add(userRole.organization);
      
      // Add parent organization if exists (for hierarchy access)
      if (userRole.organization.parent) {
        organizations.add(userRole.organization.parent);
      }
    }

    return Array.from(organizations);
  }

  /**
   * Check if user has organizational access to resource
   */
  private checkOrganizationalAccess(
    userOrganizations: Organization[],
    resourceOrganization: Organization,
  ): boolean {
    // Direct organization access
    if (userOrganizations.some(org => org.id === resourceOrganization.id)) {
      return true;
    }

    // Parent organization access
    if (resourceOrganization.parent) {
      return userOrganizations.some(org => org.id === resourceOrganization.parent.id);
    }

    return false;
  }

  /**
   * Filter data based on user's access scope
   */
  async filterPatientRecords(userId: string, organizationId?: string): Promise<PatientRecord[]> {
    const userOrganizations = await this.getUserOrganizations(userId);
    const organizationIds = userOrganizations.map(org => org.id);

    if (organizationIds.length === 0) {
      return [];
    }

    const queryBuilder = this.patientRecordRepository.createQueryBuilder('patient_record')
      .leftJoinAndSelect('patient_record.organization', 'organization')
      .where('patient_record.organizationId IN (:...organizationIds)', { organizationIds });

    if (organizationId) {
      queryBuilder.andWhere('patient_record.organizationId = :organizationId', { organizationId });
    }

    return queryBuilder.getMany();
  }

  /**
   * Check if user has any role
   */
  async hasAnyRole(userId: string): Promise<boolean> {
    const count = await this.userRoleRepository.count({
      where: { userId, isActive: true },
    });
    return count > 0;
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId, isActive: true },
      relations: ['role'],
    });

    return userRoles
      .filter(ur => ur.isValid)
      .map(ur => ur.role.name);
  }
}