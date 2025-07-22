import { UsersService } from '../services/users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("../entities/user.entity").User[]>;
    findOne(id: string): Promise<import("../entities/user.entity").User>;
    getUserRoles(id: string): Promise<import("../entities/user-role.entity").UserRole[]>;
    assignRole(userId: string, body: {
        roleId: string;
        organizationId: string;
    }): Promise<import("../entities/user-role.entity").UserRole>;
    revokeRole(roleId: string): Promise<void>;
}
