"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRbac = ApiRbac;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
function ApiRbac(operation, resource, options) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)('rbac', { action: operation, resource }), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({
        summary: options?.summary || `${operation} ${resource}`,
        description: options?.description,
    }), (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Success',
    }), (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing token',
    }), (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }), ...(options?.tags ? [(0, swagger_1.ApiTags)(...options.tags)] : []));
}
//# sourceMappingURL=api-rbac.decorator.js.map