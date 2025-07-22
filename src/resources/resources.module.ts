import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRecord } from './entities/patient-record.entity';
import { PatientRecordsService } from './services/patient-records.service';
import { PatientRecordsController } from './controllers/patient-records.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientRecord]),
    AuthModule,
    AuditModule,
  ],
  controllers: [PatientRecordsController],
  providers: [PatientRecordsService],
  exports: [PatientRecordsService],
})
export class ResourcesModule {}