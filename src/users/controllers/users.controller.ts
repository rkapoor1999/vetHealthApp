import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { RequirePermission } from '../../common/decorators/rbac.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermission('read', 'user')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermission('read', 'user')
  @ApiOperation({ summary: 'Get a specific user' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/roles')
  @RequirePermission('read', 'user')
  @ApiOperation({ summary: 'Get user roles' })
  @ApiResponse({ status: 200, description: 'User roles retrieved successfully' })
  async getUserRoles(@Param('id') id: string) {
    return this.usersService.getUserRoles(id);
  }

  @Post(':id/roles')
  @RequirePermission('update', 'user')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async assignRole(
    @Param('id') userId: string,
    @Body() body: { roleId: string; organizationId: string },
  ) {
    return this.usersService.assignRole(userId, body.roleId, body.organizationId);
  }

  @Delete('roles/:roleId')
  @RequirePermission('update', 'user')
  @ApiOperation({ summary: 'Revoke user role' })
  @ApiResponse({ status: 200, description: 'Role revoked successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async revokeRole(@Param('roleId') roleId: string) {
    return this.usersService.revokeRole(roleId);
  }
}