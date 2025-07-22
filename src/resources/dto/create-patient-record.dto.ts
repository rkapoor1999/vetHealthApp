import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreatePatientRecordDto {
  @ApiProperty({
    description: 'Unique patient/veteran identifier',
    example: 'VET001234',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Patient first name',
    example: 'John',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Patient last name',
    example: 'Doe',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Patient date of birth (YYYY-MM-DD or ISO date string)',
    example: '1980-05-15',
    type: 'string',
    format: 'date',
  })
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @ApiPropertyOptional({
    description: 'Patient medical history details',
    example: 'Veteran with PTSD and knee injury from deployment',
  })
  @IsString()
  @IsOptional()
  medicalHistory?: string;

  @ApiPropertyOptional({
    description: 'Current treatment information',
    example: 'Physical therapy and counseling sessions',
  })
  @IsString()
  @IsOptional()
  currentTreatment?: string;

  @ApiPropertyOptional({
    description: 'Organization ID (defaults to user organization if not provided)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  organizationId?: string;
}