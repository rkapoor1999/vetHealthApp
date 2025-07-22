import { User } from '../../users/entities/user.entity';
import { PatientRecord } from '../../resources/entities/patient-record.entity';
export declare enum OrganizationType {
    MEDICAL_CENTER = "medical_center",
    DEPARTMENT = "department"
}
export declare class Organization {
    id: string;
    name: string;
    description: string;
    type: OrganizationType;
    isActive: boolean;
    parent: Organization;
    children: Organization[];
    users: User[];
    patientRecords: PatientRecord[];
    createdAt: Date;
    updatedAt: Date;
    get isRootOrganization(): boolean;
    getFullPath(): string;
}
