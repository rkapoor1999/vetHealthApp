import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse,
  ApiBody,        // ✅ Add this import
  ApiParam,       // ✅ Add this import
  ApiQuery        // ✅ Add this import
} from '@nestjs/swagger';
import { PatientRecordsService } from '../services/patient-records.service';
import { CreatePatientRecordDto } from '../dto/create-patient-record.dto';
import { UpdatePatientRecordDto } from '../dto/update-patient-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/rbac.decorator';

@ApiTags('Patient Records')
@Controller('patient-records')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class PatientRecordsController {
  constructor(private readonly patientRecordsService: PatientRecordsService) {}

  @Post()
  @RequirePermission('create', 'patient_record')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new patient record',
    description: 'Creates a new patient record with the provided information. If organizationId is not provided, uses the user\'s organization.'
  })
  @ApiBody({                           // ✅ THIS IS THE KEY MISSING DECORATOR
    type: CreatePatientRecordDto,
    description: 'Patient record data',
    examples: {
      example1: {
        summary: 'Basic patient record',
        value: {
          patientId: 'VET001234',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1980-05-15',
          medicalHistory: 'Veteran with PTSD and knee injury from deployment',
          currentTreatment: 'Physical therapy and counseling sessions'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Patient record created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        patientId: 'VET001234',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-05-15',
        medicalHistory: 'Veteran with PTSD and knee injury from deployment',
        currentTreatment: 'Physical therapy and counseling sessions',
        status: 'active',
        organizationId: 'org-uuid-123',
        createdById: 'user-uuid-456',
        createdAt: '2025-07-21T10:30:00Z',
        updatedAt: '2025-07-21T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(
    @Body() createPatientRecordDto: CreatePatientRecordDto,
    @CurrentUser() user: any,
  ) {
    // If no organizationId provided, use user's organization
    if (!createPatientRecordDto.organizationId) {
      createPatientRecordDto.organizationId = user.organizationId;
    }
    return this.patientRecordsService.create(createPatientRecordDto, user.id);
  }

  @Get()
  @RequirePermission('read', 'patient_record')
  @ApiOperation({ 
    summary: 'Get all patient records',
    description: 'Retrieves all patient records accessible to the current user based on their role and organization'
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Filter by specific organization (optional)',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Patient records retrieved successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          patientId: 'VET001234',
          firstName: 'John',
          lastName: 'Doe',
          status: 'active',
          organizationId: 'org-uuid-123'
        }
      ]
    }
  })
  async findAll(
    @CurrentUser() user: any,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.patientRecordsService.findAll(user.id, organizationId);
  }

  @Get(':id')
  @RequirePermission('read', 'patient_record')
  @ApiOperation({ summary: 'Get a specific patient record' })
  @ApiParam({
    name: 'id',
    description: 'Patient record UUID',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Patient record retrieved successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        patientId: 'VET001234',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-05-15',
        medicalHistory: 'Veteran with PTSD and knee injury from deployment',
        currentTreatment: 'Physical therapy and counseling sessions',
        status: 'active'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Patient record not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientRecordsService.findOne(id, user.id);
  }

  @Patch(':id')
  @RequirePermission('update', 'patient_record')
  @ApiOperation({ summary: 'Update a patient record' })
  @ApiParam({
    name: 'id',
    description: 'Patient record UUID',
    type: String
  })
  @ApiBody({                           // ✅ Also add for PATCH
    type: UpdatePatientRecordDto,
    description: 'Updated patient record data'
  })
  @ApiResponse({ status: 200, description: 'Patient record updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Patient record not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientRecordDto: UpdatePatientRecordDto,
    @CurrentUser() user: any,
  ) {
    return this.patientRecordsService.update(id, updatePatientRecordDto, user.id);
  }

  @Delete(':id')
  @RequirePermission('delete', 'patient_record')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a patient record' })
  @ApiParam({
    name: 'id',
    description: 'Patient record UUID',
    type: String
  })
  @ApiResponse({ status: 204, description: 'Patient record deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Patient record not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.patientRecordsService.remove(id, user.id);
  }
}