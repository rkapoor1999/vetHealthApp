import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum ResourceType {
  PATIENT_RECORD = 'patient_record',
  USER = 'user',
  ORGANIZATION = 'organization',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  action: PermissionAction;

  @Column({
    type: 'varchar',
    length: 50,
  })
  resource: ResourceType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to get permission string
  get permissionString(): string {
    return `${this.action}:${this.resource}`;
  }
}