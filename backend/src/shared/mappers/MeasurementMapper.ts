import {
  MeasurementTypeDTO,
  PatternMeasurementDTO,
  FabricRequirementsDTO,
} from "@schnittmuster/dtos";
import { MeasurementType } from "@infrastructure/database/models/MeasurementType";
import { PatternMeasurement } from "@infrastructure/database/models/PatternMeasurement";

export class MeasurementMapper {
  static measurementTypeToDTO(measurementType: MeasurementType): MeasurementTypeDTO {
    return {
      id: measurementType.id,
      userId: measurementType.userId,
      name: measurementType.name,
      description: measurementType.description || undefined,
      unit: measurementType.unit,
      category: measurementType.category,
      isSystemDefault: measurementType.isSystemDefault,
      displayOrder: measurementType.displayOrder,
      createdAt: measurementType.createdAt.toISOString(),
      updatedAt: measurementType.updatedAt.toISOString(),
    };
  }

  static measurementTypeToDTOList(measurementTypes: MeasurementType[]): MeasurementTypeDTO[] {
    return measurementTypes.map((mt) => this.measurementTypeToDTO(mt));
  }

  static patternMeasurementToDTO(patternMeasurement: PatternMeasurement): PatternMeasurementDTO {
    const measurementType = (patternMeasurement as any).measurementType;
    
    return {
      id: patternMeasurement.id,
      patternId: patternMeasurement.patternId,
      measurementTypeId: patternMeasurement.measurementTypeId,
      measurementType: measurementType ? this.measurementTypeToDTO(measurementType) : undefined as any,
      value: patternMeasurement.value ? parseFloat(patternMeasurement.value.toString()) : null,
      notes: patternMeasurement.notes || undefined,
      isRequired: patternMeasurement.isRequired,
      createdAt: patternMeasurement.createdAt.toISOString(),
      updatedAt: patternMeasurement.updatedAt.toISOString(),
    };
  }

  static patternMeasurementToDTOList(patternMeasurements: PatternMeasurement[]): PatternMeasurementDTO[] {
    return patternMeasurements.map((pm) => this.patternMeasurementToDTO(pm));
  }

  static extractFabricRequirements(pattern: {
    fabricWidth: number | null;
    fabricLength: number | null;
    fabricType: string | null;
  }): FabricRequirementsDTO | undefined {
    if (!pattern.fabricWidth && !pattern.fabricLength && !pattern.fabricType) {
      return undefined;
    }

    return {
      fabricWidth: pattern.fabricWidth ? parseFloat(pattern.fabricWidth.toString()) : undefined,
      fabricLength: pattern.fabricLength ? parseFloat(pattern.fabricLength.toString()) : undefined,
      fabricType: pattern.fabricType || undefined,
    };
  }
}
