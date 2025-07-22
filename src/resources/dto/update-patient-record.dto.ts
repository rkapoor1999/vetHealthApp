import { PartialType } from '@nestjs/swagger';
import { CreatePatientRecordDto } from './create-patient-record.dto';

export class UpdatePatientRecordDto extends PartialType(CreatePatientRecordDto) {}