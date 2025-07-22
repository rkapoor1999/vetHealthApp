"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermission = exports.RBAC_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.RBAC_KEY = 'rbac';
const RequirePermission = (action, resource, allowOwn = false) => (0, common_1.SetMetadata)(exports.RBAC_KEY, { action, resource, allowOwn });
exports.RequirePermission = RequirePermission;
//# sourceMappingURL=rbac.decorator.js.map