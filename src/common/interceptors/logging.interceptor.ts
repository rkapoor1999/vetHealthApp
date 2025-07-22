import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers, body } = request;
    const userAgent = headers['user-agent'];
    const ip = headers['x-forwarded-for'] || request.connection.remoteAddress;

    const start = Date.now();
    
    // Log request
    this.logger.log(`${method} ${url} - ${ip} - ${userAgent}`);
    
    // Log request body (excluding sensitive data)
    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeRequestBody(body);
      this.logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(`${method} ${url} - ${duration}ms`);
      }),
    );
  }

  private sanitizeRequestBody(body: any): any {
    const sensitiveFields = ['password', 'token', 'secret'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    }

    return sanitized;
  }
}