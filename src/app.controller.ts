import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('System')
@Controller()
export class AppController {
  
  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'API Health Check',
    description: 'Returns basic information about the API'
  })
  @ApiResponse({
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
  })
  getRoot() {
    return {
      message: 'Veteran Healthcare RBAC API is running',
      version: '1.0.0',
      documentation: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ 
    summary: 'Health Check',
    description: 'Simple health check endpoint'
  })
  @ApiResponse({
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
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}