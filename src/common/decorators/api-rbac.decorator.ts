import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

export function ApiRbac(
  operation: string,
  resource: string,
  options?: {
    summary?: string;
    description?: string;
    tags?: string[];
  },
) {
  return applyDecorators(
    SetMetadata('rbac', { action: operation, resource }),
    ApiBearerAuth(),
    ApiOperation({
      summary: options?.summary || `${operation} ${resource}`,
      description: options?.description,
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing token',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
    }),
    ...(options?.tags ? [ApiTags(...options.tags)] : []),
  );
}