export interface AccessContext {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  organizationId?: string;
}

export interface AccessResult {
  granted: boolean;
  reason?: string;
}

export interface RoleHierarchy {
  role: string;
  permissions: string[];
  priority: number;
  inheritsFrom?: string[];
}