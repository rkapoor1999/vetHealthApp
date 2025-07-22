import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationsService } from '../services/organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { RequirePermission } from '../../common/decorators/rbac.decorator';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @RequirePermission('read', 'organization')
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({ status: 200, description: 'Organizations retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @RequirePermission('read', 'organization')
  @ApiOperation({ summary: 'Get a specific organization' })
  @ApiResponse({ status: 200, description: 'Organization retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Get(':id/descendants')
  @RequirePermission('read', 'organization')
  @ApiOperation({ summary: 'Get organization descendants' })
  @ApiResponse({ status: 200, description: 'Descendants retrieved successfully' })
  async findDescendants(@Param('id') id: string) {
    return this.organizationsService.findDescendants(id);
  }

  @Get(':id/ancestors')
  @RequirePermission('read', 'organization')
  @ApiOperation({ summary: 'Get organization ancestors' })
  @ApiResponse({ status: 200, description: 'Ancestors retrieved successfully' })
  async findAncestors(@Param('id') id: string) {
    return this.organizationsService.findAncestors(id);
  }
}