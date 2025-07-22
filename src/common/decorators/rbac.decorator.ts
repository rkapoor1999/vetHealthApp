import { SetMetadata } from '@nestjs/common';

export const RBAC_KEY = 'rbac';

export interface RbacRequirement {
  action: string;
  resource: string;
  allowOwn?: boolean; // Allow access to own resources
}

export const RequirePermission = (action: string, resource: string, allowOwn: boolean = false) =>
  SetMetadata(RBAC_KEY, { action, resource, allowOwn } as RbacRequirement);