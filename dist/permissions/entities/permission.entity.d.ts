import { Role } from './role.entity';
export declare enum PermissionAction {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete"
}
export declare enum ResourceType {
    PATIENT_RECORD = "patient_record",
    USER = "user",
    ORGANIZATION = "organization"
}
export declare class Permission {
    id: string;
    action: PermissionAction;
    resource: ResourceType;
    description: string;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
    get permissionString(): string;
}
