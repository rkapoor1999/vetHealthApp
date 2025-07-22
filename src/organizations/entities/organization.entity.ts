import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PatientRecord } from '../../resources/entities/patient-record.entity';

export enum OrganizationType {
  MEDICAL_CENTER = 'medical_center',
  DEPARTMENT = 'department',
}

@Entity('organizations')
@Tree('materialized-path')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: OrganizationType.DEPARTMENT,
  })
  type: OrganizationType;

  @Column({ default: true })
  isActive: boolean;

  @TreeParent()
  parent: Organization;

  @TreeChildren()
  children: Organization[];

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => PatientRecord, (patientRecord) => patientRecord.organization)
  patientRecords: PatientRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to check if this is a root organization (Medical Center)
  get isRootOrganization(): boolean {
    return this.type === OrganizationType.MEDICAL_CENTER && !this.parent;
  }

  // Helper method to get the full organizational path
  getFullPath(): string {
    if (!this.parent) {
      return this.name;
    }
    return `${this.parent.name} > ${this.name}`;
  }
}