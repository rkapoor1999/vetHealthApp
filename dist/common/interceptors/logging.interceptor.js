"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    logger = new common_1.Logger(LoggingInterceptor_1.name);
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, headers, body } = request;
        const userAgent = headers['user-agent'];
        const ip = headers['x-forwarded-for'] || request.connection.remoteAddress;
        const start = Date.now();
        this.logger.log(`${method} ${url} - ${ip} - ${userAgent}`);
        if (body && Object.keys(body).length > 0) {
            const sanitizedBody = this.sanitizeRequestBody(body);
            this.logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
        }
        return next.handle().pipe((0, operators_1.tap)(() => {
            const duration = Date.now() - start;
            this.logger.log(`${method} ${url} - ${duration}ms`);
        }));
    }
    sanitizeRequestBody(body) {
        const sensitiveFields = ['password', 'token', 'secret'];
        const sanitized = { ...body };
        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '***';
            }
        }
        return sanitized;
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map