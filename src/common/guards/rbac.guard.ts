import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../../auth/services/rbac.service';
import { RBAC_KEY, RbacRequirement } from '../decorators/rbac.decorator';
import { AccessContext } from '../interfaces/rbac.interface';

@Injectable()
export class RbacGuard implements CanActivate {
  private readonly logger = new Logger(RbacGuard.name);

  constructor(
    private rbacService: RbacService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rbacRequirement = this.reflector.getAllAndOverride<RbacRequirement>(
      RBAC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rbacRequirement) {
      return true; // No RBAC requirement, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request');
      return false;
    }

    const resourceId = request.params.id || request.body.id;
    const organizationId = request.params.organizationId || request.body.organizationId;

    const accessContext: AccessContext = {
      userId: user.id,
      organizationId: organizationId || user.organizationId,
      action: rbacRequirement.action,
      resource: rbacRequirement.resource,
      resourceId,
    };

    try {
      const accessResult = await this.rbacService.hasAccess(accessContext);
      
      if (!accessResult.granted) {
        this.logger.warn(
          `Access denied for user ${user.id}: ${accessResult.reason}`,
        );
        throw new ForbiddenException(accessResult.reason || 'Access denied');
      }

      return true;
    } catch (error) {
      this.logger.error('Error in RBAC guard', error);
      throw new ForbiddenException('Access denied');
    }
  }
}