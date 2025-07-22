"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginatedResult = createPaginatedResult;
function createPaginatedResult(data, total, page, limit) {
    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
//# sourceMappingURL=pagination.helper.js.map