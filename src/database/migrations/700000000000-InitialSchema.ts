// src/database/migrations/1700000000000-InitialSchema.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create organizations table
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "type" character varying NOT NULL DEFAULT 'department',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "parentId" uuid,
        "mpath" character varying DEFAULT '',
        CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id")
      );
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "password" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "organizationId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      );
    `);

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "priority" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"),
        CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
      );
    `);

    // Create permissions table
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action" character varying NOT NULL,
        "resource" character varying NOT NULL,
        "description" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")
      );
    `);

    // Create user_roles table
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "roleId" uuid NOT NULL,
        "organizationId" uuid NOT NULL,
        "expiresAt" TIMESTAMP,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id")
      );
    `);

    // Create role_permissions table
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "roleId" uuid NOT NULL,
        "permissionId" uuid NOT NULL,
        CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("roleId", "permissionId")
      );
    `);

    // Create patient_records table
    await queryRunner.query(`
      CREATE TABLE "patient_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "dateOfBirth" date NOT NULL,
        "medicalHistory" text,
        "currentTreatment" text,
        "status" character varying NOT NULL DEFAULT 'active',
        "organizationId" uuid NOT NULL,
        "createdById" uuid NOT NULL,
        "lastModifiedById" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_f4c3e5f0b1c6b3e4d5a6b7c8d9e" UNIQUE ("patientId"),
        CONSTRAINT "PK_2e6cf1c2b3a4b5c6d7e8f9a0b1c" PRIMARY KEY ("id")
      );
    `);

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "action" character varying NOT NULL,
        "result" character varying NOT NULL,
        "resourceType" character varying,
        "resourceId" uuid,
        "patientRecordId" uuid,
        "ipAddress" inet,
        "userAgent" text,
        "details" text,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_6a6d8b7c3d4e5f6g7h8i9j0k1l2" PRIMARY KEY ("id")
      );
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_organizations_parent" ON "organizations" ("parentId");`);
    await queryRunner.query(`CREATE INDEX "IDX_users_organization" ON "users" ("organizationId");`);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email");`);
    await queryRunner.query(`CREATE INDEX "IDX_user_roles_user" ON "user_roles" ("userId");`);
    await queryRunner.query(`CREATE INDEX "IDX_user_roles_role" ON "user_roles" ("roleId");`);
    await queryRunner.query(`CREATE INDEX "IDX_user_roles_organization" ON "user_roles" ("organizationId");`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_roles_unique" ON "user_roles" ("userId", "roleId", "organizationId");`);
    await queryRunner.query(`CREATE INDEX "IDX_patient_records_organization" ON "patient_records" ("organizationId");`);
    await queryRunner.query(`CREATE INDEX "IDX_patient_records_created_by" ON "patient_records" ("createdById");`);
    await queryRunner.query(`CREATE INDEX "IDX_patient_records_patient_id" ON "patient_records" ("patientId");`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_user" ON "audit_logs" ("userId");`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_resource" ON "audit_logs" ("resourceType", "resourceId");`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_patient_record" ON "audit_logs" ("patientRecordId");`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("createdAt");`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "organizations" ADD CONSTRAINT "FK_organizations_parent"
      FOREIGN KEY ("parentId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "FK_users_organization"
      FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_role"
      FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_organization"
      FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role"
      FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission"
      FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE "patient_records" ADD CONSTRAINT "FK_patient_records_organization"
      FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "patient_records" ADD CONSTRAINT "FK_patient_records_created_by"
      FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "patient_records" ADD CONSTRAINT "FK_patient_records_last_modified_by"
      FOREIGN KEY ("lastModifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_logs_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_logs_patient_record"
      FOREIGN KEY ("patientRecordId") REFERENCES "patient_records"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_patient_record";`);
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_user";`);
    await queryRunner.query(`ALTER TABLE "patient_records" DROP CONSTRAINT "FK_patient_records_last_modified_by";`);
    await queryRunner.query(`ALTER TABLE "patient_records" DROP CONSTRAINT "FK_patient_records_created_by";`);
    await queryRunner.query(`ALTER TABLE "patient_records" DROP CONSTRAINT "FK_patient_records_organization";`);
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permission";`);
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role";`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_organization";`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_role";`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_user";`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_organization";`);
    await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT "FK_organizations_parent";`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_created_at";`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_patient_record";`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_resource";`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_user";`);
    await queryRunner.query(`DROP INDEX "IDX_patient_records_patient_id";`);
    await queryRunner.query(`DROP INDEX "IDX_patient_records_created_by";`);
    await queryRunner.query(`DROP INDEX "IDX_patient_records_organization";`);
    await queryRunner.query(`DROP INDEX "IDX_user_roles_unique";`);
    await queryRunner.query(`DROP INDEX "IDX_user_roles_organization";`);
    await queryRunner.query(`DROP INDEX "IDX_user_roles_role";`);
    await queryRunner.query(`DROP INDEX "IDX_user_roles_user";`);
    await queryRunner.query(`DROP INDEX "IDX_users_email";`);
    await queryRunner.query(`DROP INDEX "IDX_users_organization";`);
    await queryRunner.query(`DROP INDEX "IDX_organizations_parent";`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "audit_logs";`);
    await queryRunner.query(`DROP TABLE "patient_records";`);
    await queryRunner.query(`DROP TABLE "role_permissions";`);
    await queryRunner.query(`DROP TABLE "user_roles";`);
    await queryRunner.query(`DROP TABLE "permissions";`);
    await queryRunner.query(`DROP TABLE "roles";`);
    await queryRunner.query(`DROP TABLE "users";`);
    await queryRunner.query(`DROP TABLE "organizations";`);
  }
}

// src/database/datasource.ts
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'password'),
  database: configService.get('DB_NAME', 'veteran_healthcare_rbac'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Always false in production
  logging: configService.get('NODE_ENV') === 'development',
});