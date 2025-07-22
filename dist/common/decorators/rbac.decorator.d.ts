export declare const RBAC_KEY = "rbac";
export interface RbacRequirement {
    action: string;
    resource: string;
    allowOwn?: boolean;
}
export declare const RequirePermission: (action: string, resource: string, allowOwn?: boolean) => import("@nestjs/common").CustomDecorator<string>;
