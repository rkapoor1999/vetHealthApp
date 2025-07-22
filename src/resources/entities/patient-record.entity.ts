import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';

export enum PatientRecordStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('patient_records')
export class PatientRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  patientId: string; // Veteran ID or similar

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'text', nullable: true })
  medicalHistory: string;

  @Column({ type: 'text', nullable: true })
  currentTreatment: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: PatientRecordStatus.ACTIVE,
  })
  status: PatientRecordStatus;

  @Column({ type: 'varchar' })
  organizationId: string;

  @Column({ type: 'varchar' })
  createdById: string;

  @Column({ type: 'varchar', nullable: true })
  lastModifiedById: string;

  @ManyToOne(() => Organization, (organization) => organization.patientRecords)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'lastModifiedById' })
  lastModifiedBy: User;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.patientRecord)
  auditLogs: AuditLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to get patient's full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Helper method to check if record is accessible
  get isAccessible(): boolean {
    return this.status === PatientRecordStatus.ACTIVE;
  }
}