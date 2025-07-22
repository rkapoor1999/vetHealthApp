import { Repository } from 'typeorm';
import { Role } from '../../permissions/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.entity';
export declare class SeedService {
    private roleRepository;
    private permissionRepository;
    private organizationRepository;
    private userRepository;
    private userRoleRepository;
    private readonly logger;
    constructor(roleRepository: Repository<Role>, permissionRepository: Repository<Permission>, organizationRepository: Repository<Organization>, userRepository: Repository<User>, userRoleRepository: Repository<UserRole>);
    seed(): Promise<void>;
    private createPermissions;
    private createRoles;
    private assignPermissionsToRoles;
    private createOrganizations;
    private createDefaultUsers;
    private assignRolesToUsers;
}
