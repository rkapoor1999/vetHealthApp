import { PatientRecordsService } from '../services/patient-records.service';
import { CreatePatientRecordDto } from '../dto/create-patient-record.dto';
import { UpdatePatientRecordDto } from '../dto/update-patient-record.dto';
export declare class PatientRecordsController {
    private readonly patientRecordsService;
    constructor(patientRecordsService: PatientRecordsService);
    create(createPatientRecordDto: CreatePatientRecordDto, user: any): Promise<import("../entities/patient-record.entity").PatientRecord>;
    findAll(user: any, organizationId?: string): Promise<import("../entities/patient-record.entity").PatientRecord[]>;
    findOne(id: string, user: any): Promise<import("../entities/patient-record.entity").PatientRecord>;
    update(id: string, updatePatientRecordDto: UpdatePatientRecordDto, user: any): Promise<import("../entities/patient-record.entity").PatientRecord>;
    remove(id: string, user: any): Promise<void>;
}
