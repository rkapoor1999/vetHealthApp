import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { RbacService } from '../../auth/services/rbac.service';
export declare class UsersService {
    private userRepository;
    private userRoleRepository;
    private rbacService;
    constructor(userRepository: Repository<User>, userRoleRepository: Repository<UserRole>, rbacService: RbacService);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    getUserRoles(userId: string): Promise<UserRole[]>;
    assignRole(userId: string, roleId: string, organizationId: string): Promise<UserRole>;
    revokeRole(userRoleId: string): Promise<void>;
}
