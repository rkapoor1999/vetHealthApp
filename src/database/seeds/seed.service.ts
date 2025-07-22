import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, RoleType } from '../../permissions/entities/role.entity';
import { Permission, PermissionAction, ResourceType } from '../../permissions/entities/permission.entity';
import { Organization, OrganizationType } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async seed() {
    this.logger.log('Starting database seeding...');

    try {
      // Create permissions first
      const permissions = await this.createPermissions();
      this.logger.log(`Created ${permissions.length} permissions`);

      // Create roles
      const roles = await this.createRoles();
      this.logger.log(`Created ${roles.length} roles`);

      // Assign permissions to roles
      await this.assignPermissionsToRoles(roles, permissions);
      this.logger.log('Assigned permissions to roles');

      // Create organizations
      const organizations = await this.createOrganizations();
      this.logger.log(`Created ${organizations.length} organizations`);

      // Create default users
      const users = await this.createDefaultUsers(organizations);
      this.logger.log(`Created ${users.length} default users`);

      // Assign roles to users
      await this.assignRolesToUsers(users, roles, organizations);
      this.logger.log('Assigned roles to users');

      this.logger.log('Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
      throw error;
    }
  }

  private async createPermissions(): Promise<Permission[]> {
    const permissionData = [
      // Patient Record permissions
      { action: PermissionAction.CREATE, resource: ResourceType.PATIENT_RECORD, description: 'Create patient records' },
      { action: PermissionAction.READ, resource: ResourceType.PATIENT_RECORD, description: 'Read patient records' },
      { action: PermissionAction.UPDATE, resource: ResourceType.PATIENT_RECORD, description: 'Update patient records' },
      { action: PermissionAction.DELETE, resource: ResourceType.PATIENT_RECORD, description: 'Delete patient records' },
      
      // User permissions
      { action: PermissionAction.CREATE, resource: ResourceType.USER, description: 'Create users' },
      { action: PermissionAction.READ, resource: ResourceType.USER, description: 'Read users' },
      { action: PermissionAction.UPDATE, resource: ResourceType.USER, description: 'Update users' },
      { action: PermissionAction.DELETE, resource: ResourceType.USER, description: 'Delete users' },
      
      // Organization permissions
      { action: PermissionAction.CREATE, resource: ResourceType.ORGANIZATION, description: 'Create organizations' },
      { action: PermissionAction.READ, resource: ResourceType.ORGANIZATION, description: 'Read organizations' },
      { action: PermissionAction.UPDATE, resource: ResourceType.ORGANIZATION, description: 'Update organizations' },
      { action: PermissionAction.DELETE, resource: ResourceType.ORGANIZATION, description: 'Delete organizations' },
    ];

    const permissions: Permission[] = [];
    
    for (const permData of permissionData) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { action: permData.action, resource: permData.resource },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create(permData);
        permissions.push(await this.permissionRepository.save(permission));
      } else {
        permissions.push(existingPermission);
      }
    }

    return permissions;
  }

  private async createRoles(): Promise<Role[]> {
    const roleData = [
      { name: RoleType.OWNER, description: 'System owner with full access', priority: 100 },
      { name: RoleType.ADMIN, description: 'Administrator with management access', priority: 50 },
      { name: RoleType.VIEWER, description: 'Viewer with read-only access', priority: 10 },
    ];

    const roles: Role[] = [];

    for (const roleDataItem of roleData) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleDataItem.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleDataItem);
        roles.push(await this.roleRepository.save(role));
      } else {
        roles.push(existingRole);
      }
    }

    return roles;
  }

  private async assignPermissionsToRoles(roles: Role[], permissions: Permission[]) {
    const rolePermissionMap = {
      [RoleType.OWNER]: [
        'create:patient_record', 'read:patient_record', 'update:patient_record', 'delete:patient_record',
        'create:user', 'read:user', 'update:user', 'delete:user',
        'create:organization', 'read:organization', 'update:organization', 'delete:organization',
      ],
      [RoleType.ADMIN]: [
        'create:patient_record', 'read:patient_record', 'update:patient_record',
        'read:user', 'update:user',
        'read:organization',
      ],
      [RoleType.VIEWER]: [
        'read:patient_record',
        'read:user',
        'read:organization',
      ],
    };

    for (const role of roles) {
      const permissionStrings = rolePermissionMap[role.name];
      const rolePermissions = permissions.filter(permission => 
        permissionStrings.includes(permission.permissionString)
      );

      if (rolePermissions.length > 0) {
        role.permissions = rolePermissions;
        await this.roleRepository.save(role);
      }
    }
  }

  private async createOrganizations(): Promise<Organization[]> {
    const organizationData = [
      { name: 'VA Medical Center - Phoenix', type: OrganizationType.MEDICAL_CENTER, description: 'Main VA Medical Center in Phoenix' },
      { name: 'Cardiology Department', type: OrganizationType.DEPARTMENT, description: 'Cardiology Department' },
      { name: 'Neurology Department', type: OrganizationType.DEPARTMENT, description: 'Neurology Department' },
      { name: 'Emergency Department', type: OrganizationType.DEPARTMENT, description: 'Emergency Department' },
    ];

    const organizations: Organization[] = [];

    // Create medical center first
    const medicalCenter = await this.organizationRepository.findOne({
      where: { name: organizationData[0].name },
    });

    let savedMedicalCenter: Organization;
    if (!medicalCenter) {
      savedMedicalCenter = await this.organizationRepository.save(
        this.organizationRepository.create(organizationData[0])
      );
    } else {
      savedMedicalCenter = medicalCenter;
    }
    organizations.push(savedMedicalCenter);

    // Create departments under medical center
    for (let i = 1; i < organizationData.length; i++) {
      const existingDepartment = await this.organizationRepository.findOne({
        where: { name: organizationData[i].name },
      });

      if (!existingDepartment) {
        const department = this.organizationRepository.create({
          ...organizationData[i],
          parent: savedMedicalCenter,
        });
        organizations.push(await this.organizationRepository.save(department));
      } else {
        organizations.push(existingDepartment);
      }
    }

    return organizations;
  }

  private async createDefaultUsers(organizations: Organization[]): Promise<User[]> {
    const medicalCenter = organizations.find(org => org.type === OrganizationType.MEDICAL_CENTER);
    const departments = organizations.filter(org => org.type === OrganizationType.DEPARTMENT);

    if (!medicalCenter) {
      throw new Error('Medical center not found in organizations');
    }

    const hashedPassword = await bcrypt.hash('DefaultPassword123!', 10);

    const userData = [
      {
        email: 'owner@va.gov',
        firstName: 'System',
        lastName: 'Owner',
        password: hashedPassword,
        organizationId: medicalCenter.id,
        isActive: true,
      },
      {
        email: 'admin@va.gov',
        firstName: 'Department',
        lastName: 'Admin',
        password: hashedPassword,
        organizationId: departments[0].id,
        isActive: true,
      },
      {
        email: 'viewer@va.gov',
        firstName: 'Medical',
        lastName: 'Viewer',
        password: hashedPassword,
        organizationId: departments[1].id,
        isActive: true,
      },
    ];

    const users: User[] = [];

    for (const userDataItem of userData) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userDataItem.email },
      });

      if (!existingUser) {
        const user = this.userRepository.create(userDataItem);
        users.push(await this.userRepository.save(user));
      } else {
        users.push(existingUser);
      }
    }

    return users;
  }

  private async assignRolesToUsers(users: User[], roles: Role[], organizations: Organization[]) {
    const userRoleAssignments = [
      { userEmail: 'owner@va.gov', roleName: RoleType.OWNER },
      { userEmail: 'admin@va.gov', roleName: RoleType.ADMIN },
      { userEmail: 'viewer@va.gov', roleName: RoleType.VIEWER },
    ];

    for (const assignment of userRoleAssignments) {
      const user = users.find(u => u.email === assignment.userEmail);
      const role = roles.find(r => r.name === assignment.roleName);

      if (user && role) {
        const existingUserRole = await this.userRoleRepository.findOne({
          where: { userId: user.id, roleId: role.id, organizationId: user.organizationId },
        });

        if (!existingUserRole) {
          const userRole = this.userRoleRepository.create({
            userId: user.id,
            roleId: role.id,
            organizationId: user.organizationId,
            isActive: true,
          });
          await this.userRoleRepository.save(userRole);
        }
      }
    }
  }
}