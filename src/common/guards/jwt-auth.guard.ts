import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../../auth/services/rbac.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Authenticate user first
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Skip RBAC for health/system endpoints  
    if (this.isSystemEndpoint(request.url)) {
      return true;
    }

    // Check if user has any roles at all
    const hasRoles = await this.rbacService.hasAnyRole(user.id);
    if (!hasRoles) {
      this.logger.warn(`User ${user.email} has no roles assigned`);
      return false;
    }

    // Extract resource and action from request
    const action = this.mapMethodToAction(request.method);
    const resource = this.extractResourceFromPath(request.route?.path || request.url);

    // Check RBAC permissions
    const accessResult = await this.rbacService.hasAccess({
      userId: user.id,
      action,
      resource,
      organizationId: user.organizationId,
    });

    if (!accessResult.granted) {
      this.logger.warn(`Access denied for user ${user.email}: ${accessResult.reason}`);
      return false;
    }

    return true;
  }

  /**
   * Check if this is a system endpoint that doesn't need RBAC
   */
  private isSystemEndpoint(url: string): boolean {
    const systemPaths = [
      '/api/health',
      '/api/docs',
      '/',
      '/api',
    ];
    
    return systemPaths.some(path => url === path || url.startsWith(path));
  }

  /**
   * Extract resource name from API path
   */
  private extractResourceFromPath(path: string): string {
    // Remove /api prefix and get first segment
    const segments = path
      .replace('/api/', '')
      .split('/')
      .filter(segment => segment && !segment.startsWith(':'));
    
    // Map common API patterns
    const resource = segments[0] || 'unknown';
    
    // Handle common plurals/patterns
    const resourceMap: Record<string, string> = {
      'users': 'user',
      'patient-records': 'patient_record',
      'organizations': 'organization', 
      'permissions': 'permission',
      'roles': 'role',
      'auth': 'auth',
    };

    return resourceMap[resource] || resource;
  }

  /**
   * Map HTTP methods to RBAC actions
   */
  private mapMethodToAction(method: string): string {
    const actionMap: Record<string, string> = {
      'GET': 'read',
      'POST': 'create',
      'PUT': 'update',
      'PATCH': 'update', 
      'DELETE': 'delete',
    };
    
    return actionMap[method?.toUpperCase()] || 'read';
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}