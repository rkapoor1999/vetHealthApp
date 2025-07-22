"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("./common/decorators/public.decorator");
let AppController = class AppController {
    getRoot() {
        return {
            message: 'Veteran Healthcare RBAC API is running',
            version: '1.0.0',
            documentation: '/api/docs',
            timestamp: new Date().toISOString(),
        };
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'API Health Check',
        description: 'Returns basic information about the API'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'API is running',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Veteran Healthcare RBAC API is running'
                },
                version: {
                    type: 'string',
                    example: '1.0.0'
                },
                documentation: {
                    type: 'string',
                    example: '/api/docs'
                },
                timestamp: {
                    type: 'string',
                    example: '2025-07-18T01:46:00.583Z'
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Health Check',
        description: 'Simple health check endpoint'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service is healthy',
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    example: 'ok'
                },
                timestamp: {
                    type: 'string',
                    example: '2025-07-18T01:46:00.583Z'
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('System'),
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map