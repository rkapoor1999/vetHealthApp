import { PermissionsService } from '../services/permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findAllRoles(): Promise<import("../entities/role.entity").Role[]>;
    findAllPermissions(): Promise<import("../entities/permission.entity").Permission[]>;
    findRoleById(id: string): Promise<import("../entities/role.entity").Role>;
}
