import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RbacService } from './rbac.service';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { Role, RoleType } from '../../permissions/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { PatientRecord } from '../../resources/entities/patient-record.entity';
import { AuditService } from '../../audit/services/audit.service';

describe('RbacService', () => {
  let service: RbacService;
  let module: TestingModule;
  let userRepository: Repository<User>;
  let userRoleRepository: Repository<UserRole>;
  let auditService: AuditService;

  // Create complete mock objects with all required properties
  const mockUser: Partial<User> = {
    id: 'user1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    isActive: true,
    organizationId: 'org1',
    userRoles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRole: Partial<Role> = {
    id: 'role1',
    name: RoleType.ADMIN,
    description: 'Admin role',
    permissions: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRole: Partial<UserRole> = {
    id: 'userRole1',
    userId: 'user1',
    roleId: 'role1',
    organizationId: 'org1',
    role: mockRole as Role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    get isValid() { return this.isActive; }
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: {
            find: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PatientRecord),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            logAccess: jest.fn(),
            logAccessDenied: jest.fn(),
          },
        },
      ],
    }).compile();

    module = moduleRef;
    service = moduleRef.get<RbacService>(RbacService);
    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    userRoleRepository = moduleRef.get<Repository<UserRole>>(getRepositoryToken(UserRole));
    auditService = moduleRef.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasAccess', () => {
    it('should grant access for valid permissions', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(userRoleRepository, 'find').mockResolvedValue([mockUserRole as UserRole]);

      const result = await service.hasAccess({
        userId: 'user1',
        action: 'read',
        resource: 'patient_record',
      });

      expect(result.granted).toBe(true);
      expect(auditService.logAccess).toHaveBeenCalled();
    });

    it('should deny access for insufficient permissions', async () => {
      // Use VIEWER role which only has read permissions
      const viewerRole = { ...mockRole, name: RoleType.VIEWER };
      const viewerUserRole = { ...mockUserRole, role: viewerRole as Role };
      
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(userRoleRepository, 'find').mockResolvedValue([viewerUserRole as UserRole]);

      const result = await service.hasAccess({
        userId: 'user1',
        action: 'delete',
        resource: 'patient_record',
      });

      expect(result.granted).toBe(false);
      expect(result.reason).toBe('Insufficient permissions');
      expect(auditService.logAccessDenied).toHaveBeenCalled();
    });

    it('should deny access for non-permitted resource', async () => {
      // Test accessing a resource type that doesn't exist in permissions
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(userRoleRepository, 'find').mockResolvedValue([mockUserRole as UserRole]);

      const result = await service.hasAccess({
        userId: 'user1',
        action: 'read',
        resource: 'non_existent_resource',
      });

      expect(result.granted).toBe(false);
      expect(result.reason).toBe('Insufficient permissions');
      expect(auditService.logAccessDenied).toHaveBeenCalled();
    });

    it('should deny access for non-existent user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.hasAccess({
        userId: 'nonexistent',
        action: 'read',
        resource: 'patient_record',
      });

      expect(result.granted).toBe(false);
      expect(result.reason).toBe('User not found');
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions for admin role', async () => {
      const mockUserRoles = [
        {
          id: 'userRole1',
          userId: 'user1',
          roleId: 'role1',
          organizationId: 'org1',
          role: { name: RoleType.ADMIN },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          get isValid() { return true; }
        },
      ];

      jest.spyOn(userRoleRepository, 'find').mockResolvedValue(mockUserRoles as UserRole[]);

      const permissions = await service.getUserPermissions('user1');

      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions.length).toBeGreaterThan(0);
      // Admin should have multiple permissions
      expect(permissions).toContain('read:patient_record');
      expect(permissions).toContain('create:patient_record');
    });

    it('should return limited permissions for viewer role', async () => {
      const mockUserRoles = [
        {
          id: 'userRole1',
          userId: 'user1',
          roleId: 'role1',
          organizationId: 'org1',
          role: { name: RoleType.VIEWER },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          get isValid() { return true; }
        },
      ];

      jest.spyOn(userRoleRepository, 'find').mockResolvedValue(mockUserRoles as UserRole[]);

      const permissions = await service.getUserPermissions('user1');

      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions.length).toBeGreaterThan(0);
      // Viewer should only have read permissions
      expect(permissions).toContain('read:patient_record');
      expect(permissions).not.toContain('delete:patient_record');
    });

    it('should filter out invalid roles', async () => {
      const mockUserRoles = [
        {
          id: 'userRole1',
          userId: 'user1',
          roleId: 'role1',
          organizationId: 'org1',
          role: { name: RoleType.ADMIN },
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          get isValid() { return false; }
        },
      ];

      jest.spyOn(userRoleRepository, 'find').mockResolvedValue(mockUserRoles as UserRole[]);

      const permissions = await service.getUserPermissions('user1');

      expect(permissions).toEqual([]);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true if user has roles', async () => {
      jest.spyOn(userRoleRepository, 'count').mockResolvedValue(1);

      const result = await service.hasAnyRole('user1');

      expect(result).toBe(true);
    });

    it('should return false if user has no roles', async () => {
      jest.spyOn(userRoleRepository, 'count').mockResolvedValue(0);

      const result = await service.hasAnyRole('user1');

      expect(result).toBe(false);
    });
  });

  describe('getUserRoles', () => {
    it('should return user role names', async () => {
      const mockUserRoles = [
        {
          id: 'userRole1',
          userId: 'user1',
          roleId: 'role1',
          organizationId: 'org1',
          role: { name: RoleType.ADMIN },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          get isValid() { return true; }
        },
      ];

      jest.spyOn(userRoleRepository, 'find').mockResolvedValue(mockUserRoles as UserRole[]);

      const roles = await service.getUserRoles('user1');

      expect(roles).toEqual([RoleType.ADMIN]);
    });
  });

  describe('filterPatientRecords', () => {
    it('should filter patient records by user organization access', async () => {
      const mockOrganization = {
        id: 'org1',
        name: 'Test Department',
        type: 'department',
      };

      const mockUserRoleWithOrg = {
        id: 'userRole1',
        userId: 'user1',
        roleId: 'role1',
        organizationId: 'org1',
        role: { name: RoleType.ADMIN },
        organization: mockOrganization,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        get isValid() { return true; }
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{
          id: 'record1',
          patientId: 'VET001',
          organizationId: 'org1'
        }]),
      };

      jest.spyOn(userRoleRepository, 'find').mockResolvedValue([mockUserRoleWithOrg as UserRole]);
      
      const patientRecordRepository = module.get<Repository<PatientRecord>>(
        getRepositoryToken(PatientRecord)
      );
      jest.spyOn(patientRecordRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.filterPatientRecords('user1');

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('patient_record.organization', 'organization');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'patient_record.organizationId IN (:...organizationIds)', 
        { organizationIds: ['org1'] }
      );
      expect(result).toHaveLength(1);
    });

    it('should filter by specific organization when provided', async () => {
      const mockUserRoleWithOrg = {
        id: 'userRole1',
        userId: 'user1',
        roleId: 'role1',
        organizationId: 'org1',
        role: { name: RoleType.ADMIN },
        organization: { id: 'org1', name: 'Test Department' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        get isValid() { return true; }
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(userRoleRepository, 'find').mockResolvedValue([mockUserRoleWithOrg as UserRole]);
      
      const patientRecordRepository = module.get<Repository<PatientRecord>>(
        getRepositoryToken(PatientRecord)
      );
      jest.spyOn(patientRecordRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.filterPatientRecords('user1', 'specific-org');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'patient_record.organizationId = :organizationId', 
        { organizationId: 'specific-org' }
      );
    });

    it('should return empty array if user has no organizational access', async () => {
      jest.spyOn(userRoleRepository, 'find').mockResolvedValue([]);

      const result = await service.filterPatientRecords('user1');

      expect(result).toEqual([]);
    });
  });

  describe('organizational scoped access', () => {
    it('should grant access when user has organizational permission', async () => {
      const mockPatientRecord = {
        id: 'record1',
        organizationId: 'org1',
        organization: { id: 'org1', name: 'Test Department' }
      };

      const mockUserRoleWithOrg = {
        id: 'userRole1',
        userId: 'user1',
        roleId: 'role1',
        organizationId: 'org1',
        role: { name: RoleType.ADMIN },
        organization: { id: 'org1', name: 'Test Department' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        get isValid() { return true; }
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(userRoleRepository, 'find').mockResolvedValue([mockUserRoleWithOrg as UserRole]);
      
      const patientRecordRepository = module.get<Repository<PatientRecord>>(
        getRepositoryToken(PatientRecord)
      );
      jest.spyOn(patientRecordRepository, 'findOne').mockResolvedValue(mockPatientRecord as PatientRecord);

      const result = await service.hasAccess({
        userId: 'user1',
        action: 'read',
        resource: 'patient_record',
        resourceId: 'record1',
        organizationId: 'org1',
      });

      expect(result.granted).toBe(true);
    });
  });
});