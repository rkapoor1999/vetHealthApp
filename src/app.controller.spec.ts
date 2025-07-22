import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getRoot', () => {
    it('should return API information', () => {
      const result = appController.getRoot();
      
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('documentation');
      expect(result).toHaveProperty('timestamp');
      expect(result.message).toBe('Veteran Healthcare RBAC API is running');
      expect(result.version).toBe('1.0.0');
      expect(result.documentation).toBe('/api/docs');
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result.status).toBe('ok');
    });
  });
});