import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { Role } from '../permissions/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { PatientRecord } from '../resources/entities/patient-record.entity';
import { AuditModule } from '../audit/audit.module';
import { AuthService } from './services/auth.service';
import { RbacService } from './services/rbac.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,        // ✅ Added UserRole repository
      Role,           // ✅ Added Role repository  
      Permission,
      Organization,
      PatientRecord,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '24h'),
        },
      }),
    }),
    AuditModule,
  ],
  providers: [AuthService, RbacService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, RbacService], // ✅ Export RbacService for guards
})
export class AuthModule {}