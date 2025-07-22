import { Injectable, UnauthorizedException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { Role, RoleType } from '../../permissions/entities/role.entity';
import { Organization, OrganizationType } from '../../organizations/entities/organization.entity';
import { AuditService } from '../../audit/services/audit.service';
import { JwtPayload } from '../strategies/jwt.strategy';
import { LoginDto, RegisterDto, AuthResult } from '../dto/auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private defaultOrganizationId: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultOrganization();
    await this.ensureDefaultRoles();
  }

  private async ensureDefaultOrganization() {
    try {
      let existingOrg = await this.organizationRepository.findOne({
        where: { name: 'Default Organization' },
      });

      if (!existingOrg) {
        existingOrg = await this.organizationRepository.save({
          name: 'Default Organization',
          type: OrganizationType.MEDICAL_CENTER,
          description: 'Default organization for new users',
          isActive: true,
        });
        this.logger.log('✅ Created default organization');
      }

      this.defaultOrganizationId = existingOrg.id;
    } catch (error) {
      this.logger.error('Failed to create default organization:', error);
    }
  }

  private async ensureDefaultRoles() {
    try {
      const roles = [
        {
          name: RoleType.OWNER,
          description: 'System owner with full access',
          isActive: true,
        },
        {
          name: RoleType.ADMIN,
          description: 'Administrator with management access',
          isActive: true,
        },
        {
          name: RoleType.VIEWER,
          description: 'Basic user with read-only access',
          isActive: true,
        },
      ];

      for (const roleData of roles) {
        const existingRole = await this.roleRepository.findOne({
          where: { name: roleData.name },
        });

        if (!existingRole) {
          await this.roleRepository.save(roleData);
          this.logger.log(`✅ Created role: ${roleData.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to create default roles:', error);
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResult> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Handle organization ID
    let organizationId = registerDto.organizationId;
    
    if (organizationId) {
      const organization = await this.organizationRepository.findOne({
        where: { id: organizationId, isActive: true },
      });
      
      if (!organization) {
        organizationId = await this.getDefaultOrganizationId();
      }
    } else {
      organizationId = await this.getDefaultOrganizationId();
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = this.userRepository.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: hashedPassword,
      organizationId: organizationId,
    });

    const savedUser = await this.userRepository.save(user);

    // 🎯 ASSIGN DEFAULT ROLE
    await this.assignDefaultRole(savedUser);

    const payload: JwtPayload = {
      sub: savedUser.id,
      email: savedUser.email,
      organizationId: savedUser.organizationId,
    };

    const access_token = this.jwtService.sign(payload);

    this.logger.log(`✅ User registered with role: ${savedUser.email}`);

    return {
      access_token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        organizationId: savedUser.organizationId,
      },
    };
  }

  /**
   * Assign role based on simple rules:
   * 1. First user = OWNER
   * 2. Admin emails = ADMIN  
   * 3. Everyone else = VIEWER
   */
  private async assignDefaultRole(user: User) {
    try {
      let assignedRole: RoleType;

      // Check if this is the first user or no owner exists
      const userCount = await this.userRepository.count();
      const ownerExists = await this.userRoleRepository.findOne({
        relations: ['role'],
        where: {
          role: { name: RoleType.OWNER },
          isActive: true,
        },
      });

      if (userCount === 1 || !ownerExists) {
        assignedRole = RoleType.OWNER;
        this.logger.log(`👑 First user becomes OWNER: ${user.email}`);
      } else if (this.isAdminEmail(user.email)) {
        assignedRole = RoleType.ADMIN;
        this.logger.log(`🛡️  Admin user: ${user.email}`);
      } else {
        assignedRole = RoleType.VIEWER;
        this.logger.log(`👁️  Regular user: ${user.email}`);
      }

      const role = await this.roleRepository.findOne({
        where: { name: assignedRole, isActive: true },
      });

      if (role) {
        await this.userRoleRepository.save({
          userId: user.id,
          roleId: role.id,
          organizationId: user.organizationId,
          isActive: true,
        });

        this.logger.log(`✅ Assigned ${assignedRole} role to user: ${user.email}`);
      } else {
        this.logger.error(`❌ Role ${assignedRole} not found`);
      }
    } catch (error) {
      this.logger.error('Failed to assign default role:', error);
    }
  }

  /**
   * Check if email should get admin privileges
   */
  private isAdminEmail(email: string): boolean {
    return (
      email.startsWith('admin@') ||
      email.startsWith('administrator@') ||
      email.includes('.admin@') ||
      email.includes('admin.')
    );
  }

  private async getDefaultOrganizationId(): Promise<string> {
    if (this.defaultOrganizationId) {
      return this.defaultOrganizationId;
    }

    let defaultOrg = await this.organizationRepository.findOne({
      where: { name: 'Default Organization' },
    });

    if (!defaultOrg) {
      defaultOrg = await this.organizationRepository.save({
        name: 'Default Organization',
        type: OrganizationType.MEDICAL_CENTER,
        description: 'Default organization for new users',
        isActive: true,
      });
      this.logger.log('Created default organization on demand');
    }

    this.defaultOrganizationId = defaultOrg.id;
    return defaultOrg.id;
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
    };

    const access_token = this.jwtService.sign(payload);

    // Log successful login
    await this.auditService.logLogin(user.id);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.auditService.logLogout(userId);
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['organization'],
    });
  }
}