import { Repository } from 'typeorm';
import { PatientRecord } from '../entities/patient-record.entity';
import { CreatePatientRecordDto } from '../dto/create-patient-record.dto';
import { UpdatePatientRecordDto } from '../dto/update-patient-record.dto';
import { RbacService } from '../../auth/services/rbac.service';
import { AuditService } from '../../audit/services/audit.service';
export declare class PatientRecordsService {
    private patientRecordRepository;
    private rbacService;
    private auditService;
    constructor(patientRecordRepository: Repository<PatientRecord>, rbacService: RbacService, auditService: AuditService);
    create(createPatientRecordDto: CreatePatientRecordDto, userId: string): Promise<PatientRecord>;
    findAll(userId: string, organizationId?: string): Promise<PatientRecord[]>;
    findOne(id: string, userId: string): Promise<PatientRecord>;
    update(id: string, updatePatientRecordDto: UpdatePatientRecordDto, userId: string): Promise<PatientRecord>;
    remove(id: string, userId: string): Promise<void>;
}
