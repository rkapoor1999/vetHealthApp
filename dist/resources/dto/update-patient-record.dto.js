"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePatientRecordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_patient_record_dto_1 = require("./create-patient-record.dto");
class UpdatePatientRecordDto extends (0, swagger_1.PartialType)(create_patient_record_dto_1.CreatePatientRecordDto) {
}
exports.UpdatePatientRecordDto = UpdatePatientRecordDto;
//# sourceMappingURL=update-patient-record.dto.js.map