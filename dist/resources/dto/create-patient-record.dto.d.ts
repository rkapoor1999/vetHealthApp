export declare class CreatePatientRecordDto {
    patientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    medicalHistory?: string;
    currentTreatment?: string;
    organizationId?: string;
}
