import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const nodeEnv = configService.get('NODE_ENV', 'development');
  
  // For development, use SQLite for simplicity
  if (nodeEnv === 'development') {
    return {
      type: 'sqlite',
      database: 'veteran_healthcare_rbac.db',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // Auto-create tables in development
      logging: true,
      dropSchema: false, // Don't drop schema on restart
    };
  }
  
  // For production, use PostgreSQL
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'password'),
    database: configService.get('DB_NAME', 'veteran_healthcare_rbac'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false, // Never use synchronize in production
    logging: configService.get('NODE_ENV') === 'development',
    migrationsRun: true,
  };
};