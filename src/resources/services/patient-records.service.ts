import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientRecord } from '../entities/patient-record.entity';
import { CreatePatientRecordDto } from '../dto/create-patient-record.dto';
import { UpdatePatientRecordDto } from '../dto/update-patient-record.dto';
import { RbacService } from '../../auth/services/rbac.service';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class PatientRecordsService {
  constructor(
    @InjectRepository(PatientRecord)
    private patientRecordRepository: Repository<PatientRecord>,
    private rbacService: RbacService,
    private auditService: AuditService,
  ) {}

  async create(
    createPatientRecordDto: CreatePatientRecordDto,
    userId: string,
  ): Promise<PatientRecord> {
    const patientRecord = this.patientRecordRepository.create({
      ...createPatientRecordDto,
      createdById: userId,
      organizationId: createPatientRecordDto.organizationId,
    });

    const savedRecord = await this.patientRecordRepository.save(patientRecord);

    await this.auditService.logResourceCreation(
      userId,
      'patient_record',
      savedRecord.id,
      `Created patient record for ${savedRecord.fullName}`,
    );

    return savedRecord;
  }

  async findAll(userId: string, organizationId?: string): Promise<PatientRecord[]> {
    return this.rbacService.filterPatientRecords(userId, organizationId);
  }

  async findOne(id: string, userId: string): Promise<PatientRecord> {
    const patientRecord = await this.patientRecordRepository.findOne({
      where: { id },
      relations: ['organization', 'createdBy', 'lastModifiedBy'],
    });

    if (!patientRecord) {
      throw new NotFoundException('Patient record not found');
    }

    return patientRecord;
  }

  async update(
    id: string,
    updatePatientRecordDto: UpdatePatientRecordDto,
    userId: string,
  ): Promise<PatientRecord> {
    const patientRecord = await this.findOne(id, userId);

    Object.assign(patientRecord, updatePatientRecordDto);
    patientRecord.lastModifiedById = userId;

    const updatedRecord = await this.patientRecordRepository.save(patientRecord);

    await this.auditService.logResourceUpdate(
      userId,
      'patient_record',
      id,
      `Updated patient record for ${updatedRecord.fullName}`,
    );

    return updatedRecord;
  }

  async remove(id: string, userId: string): Promise<void> {
    const patientRecord = await this.findOne(id, userId);

    await this.patientRecordRepository.remove(patientRecord);

    await this.auditService.logResourceDeletion(
      userId,
      'patient_record',
      id,
      `Deleted patient record for ${patientRecord.fullName}`,
    );
  }
}