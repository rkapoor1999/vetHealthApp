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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new patient record' })
  @ApiResponse({ status: 201, description: 'Patient record created successfully' })
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
  @ApiOperation({ summary: 'Get all patient records' })
  @ApiResponse({ status: 200, description: 'Patient records retrieved successfully' })
  async findAll(
    @CurrentUser() user: any,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.patientRecordsService.findAll(user.id, organizationId);
  }

  @Get(':id')
  @RequirePermission('read', 'patient_record')
  @ApiOperation({ summary: 'Get a specific patient record' })
  @ApiResponse({ status: 200, description: 'Patient record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Patient record not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientRecordsService.findOne(id, user.id);
  }

  @Patch(':id')
  @RequirePermission('update', 'patient_record')
  @ApiOperation({ summary: 'Update a patient record' })
  @ApiResponse({ status: 200, description: 'Patient record updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
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
  @ApiResponse({ status: 204, description: 'Patient record deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.patientRecordsService.remove(id, user.id);
  }
}