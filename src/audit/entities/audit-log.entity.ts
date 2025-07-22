import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PatientRecord } from '../../resources/entities/patient-record.entity';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  ACCESS_DENIED = 'access_denied',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export enum AuditResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  DENIED = 'denied',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  action: AuditAction;

  @Column({
    type: 'varchar',
    length: 50,
  })
  result: AuditResult;

  @Column({ nullable: true })
  resourceType: string;

  @Column({ type: 'varchar', nullable: true })
  resourceId: string;

  @Column({ type: 'varchar', nullable: true })
  patientRecordId: string;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON as string for SQLite compatibility

  @ManyToOne(() => User, (user) => user.auditLogs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => PatientRecord, (patientRecord) => patientRecord.auditLogs)
  @JoinColumn({ name: 'patientRecordId' })
  patientRecord: PatientRecord;

  @CreateDateColumn()
  createdAt: Date;

  // Helper method to create a log entry
  static createLog(
    userId: string,
    action: AuditAction,
    result: AuditResult,
    resourceType?: string,
    resourceId?: string,
    details?: string,
    metadata?: any,
  ): Partial<AuditLog> {
    return {
      userId,
      action,
      result,
      resourceType,
      resourceId,
      details,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    };
  }

  // Helper method to parse metadata
  get parsedMetadata(): any {
    return this.metadata ? JSON.parse(this.metadata) : null;
  }
}