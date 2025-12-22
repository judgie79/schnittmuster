import { MeasurementTypeRepository } from "@infrastructure/database/repositories/MeasurementTypeRepository";
import { MeasurementMapper } from "@shared/mappers";
import {
  MeasurementTypeDTO,
  MeasurementTypeCreateDTO,
  MeasurementTypeUpdateDTO,
  MeasurementCategory,
} from "@schnittmuster/dtos";
import { NotFoundError } from "@shared/errors";
import { ForbiddenError } from "@shared/errors";

export class MeasurementTypeService {
  constructor(private readonly measurementTypeRepository = new MeasurementTypeRepository()) {}

  async list(userId: string): Promise<MeasurementTypeDTO[]> {
    const measurementTypes = await this.measurementTypeRepository.findAll(userId);
    return MeasurementMapper.measurementTypeToDTOList(measurementTypes);
  }

  async listByCategory(category: MeasurementCategory, userId: string): Promise<MeasurementTypeDTO[]> {
    const measurementTypes = await this.measurementTypeRepository.findByCategory(category, userId);
    return MeasurementMapper.measurementTypeToDTOList(measurementTypes);
  }

  async listSystemDefaults(): Promise<MeasurementTypeDTO[]> {
    const measurementTypes = await this.measurementTypeRepository.findSystemDefaults();
    return MeasurementMapper.measurementTypeToDTOList(measurementTypes);
  }

  async listUserCustom(userId: string): Promise<MeasurementTypeDTO[]> {
    const measurementTypes = await this.measurementTypeRepository.findUserCustom(userId);
    return MeasurementMapper.measurementTypeToDTOList(measurementTypes);
  }

  async get(id: string, userId: string): Promise<MeasurementTypeDTO> {
    const measurementType = await this.measurementTypeRepository.findById(id);
    if (!measurementType) {
      throw new NotFoundError("MeasurementType");
    }

    if (!measurementType.isSystemDefault && measurementType.userId !== userId) {
      throw new ForbiddenError("You don't have access to this measurement type");
    }

    return MeasurementMapper.measurementTypeToDTO(measurementType);
  }

  async create(userId: string, payload: MeasurementTypeCreateDTO): Promise<MeasurementTypeDTO> {
    const measurementType = await this.measurementTypeRepository.create({
      userId,
      name: payload.name,
      description: payload.description || null,
      unit: payload.unit,
      category: payload.category,
      isSystemDefault: false,
      displayOrder: payload.displayOrder || 0,
    });

    return MeasurementMapper.measurementTypeToDTO(measurementType);
  }

  async update(id: string, userId: string, payload: MeasurementTypeUpdateDTO): Promise<MeasurementTypeDTO> {
    const measurementType = await this.measurementTypeRepository.findById(id);
    if (!measurementType) {
      throw new NotFoundError("MeasurementType");
    }

    if (measurementType.isSystemDefault) {
      throw new ForbiddenError("Cannot update system default measurement types");
    }

    if (measurementType.userId !== userId) {
      throw new ForbiddenError("You don't have permission to update this measurement type");
    }

    const updated = await this.measurementTypeRepository.update(id, {
      name: payload.name,
      description: payload.description || null,
      unit: payload.unit,
      category: payload.category,
      displayOrder: payload.displayOrder,
    });

    return MeasurementMapper.measurementTypeToDTO(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    const measurementType = await this.measurementTypeRepository.findById(id);
    if (!measurementType) {
      throw new NotFoundError("MeasurementType");
    }

    if (measurementType.isSystemDefault) {
      throw new ForbiddenError("Cannot delete system default measurement types");
    }

    if (measurementType.userId !== userId) {
      throw new ForbiddenError("You don't have permission to delete this measurement type");
    }

    await this.measurementTypeRepository.delete(id);
  }
}
