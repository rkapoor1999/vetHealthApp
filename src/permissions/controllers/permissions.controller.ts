import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionsService } from '../services/permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { RequirePermission } from '../../common/decorators/rbac.decorator';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('roles')
  @RequirePermission('read', 'organization')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAllRoles() {
    return this.permissionsService.findAllRoles();
  }

  @Get('permissions')
  @RequirePermission('read', 'organization')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  async findAllPermissions() {
    return this.permissionsService.findAllPermissions();
  }

  @Get('roles/:id')
  @RequirePermission('read', 'organization')
  @ApiOperation({ summary: 'Get a specific role' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findRoleById(@Param('id') id: string) {
    return this.permissionsService.findRoleById(id);
  }
}