import { FindOptions, Op, WhereOptions } from "sequelize";
import { MeasurementType, MeasurementTypeCreationAttributes } from "@infrastructure/database/models/MeasurementType";
import { NotFoundError } from "@shared/errors";

export class MeasurementTypeRepository {
  async findById(id: string): Promise<MeasurementType | null> {
    return MeasurementType.findByPk(id);
  }

  async findAll(userId?: string): Promise<MeasurementType[]> {
    const where: WhereOptions = {
      [Op.or]: [{ isSystemDefault: true }, { userId: userId || null }],
    };

    return MeasurementType.findAll({
      where,
      order: [["displayOrder", "ASC"], ["name", "ASC"]],
    });
  }

  async findByCategory(category: string, userId?: string): Promise<MeasurementType[]> {
    const where: WhereOptions = {
      category,
      [Op.or]: [{ isSystemDefault: true }, { userId: userId || null }],
    };

    return MeasurementType.findAll({
      where,
      order: [["displayOrder", "ASC"], ["name", "ASC"]],
    });
  }

  async findSystemDefaults(): Promise<MeasurementType[]> {
    return MeasurementType.findAll({
      where: { isSystemDefault: true },
      order: [["displayOrder", "ASC"]],
    });
  }

  async findUserCustom(userId: string): Promise<MeasurementType[]> {
    return MeasurementType.findAll({
      where: { userId, isSystemDefault: false },
      order: [["displayOrder", "ASC"], ["name", "ASC"]],
    });
  }

  async create(data: MeasurementTypeCreationAttributes): Promise<MeasurementType> {
    return MeasurementType.create(data);
  }

  async update(id: string, data: Partial<MeasurementType>): Promise<MeasurementType> {
    const measurementType = await this.findById(id);
    if (!measurementType) {
      throw new NotFoundError("MeasurementType");
    }
    await measurementType.update(data);
    return measurementType;
  }

  async delete(id: string): Promise<void> {
    const measurementType = await this.findById(id);
    if (!measurementType) {
      throw new NotFoundError("MeasurementType");
    }
    if (measurementType.isSystemDefault) {
      throw new Error("Cannot delete system default measurement types");
    }
    await measurementType.destroy();
  }
}
