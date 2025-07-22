import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
export declare class PermissionsService {
    private roleRepository;
    private permissionRepository;
    constructor(roleRepository: Repository<Role>, permissionRepository: Repository<Permission>);
    findAllRoles(): Promise<Role[]>;
    findAllPermissions(): Promise<Permission[]>;
    findRoleById(id: string): Promise<Role>;
}
