import { FindOptions } from "sequelize";
import { PatternMeasurement, PatternMeasurementCreationAttributes } from "@infrastructure/database/models/PatternMeasurement";
import { MeasurementType } from "@infrastructure/database/models/MeasurementType";
import { NotFoundError } from "@shared/errors";

export class PatternMeasurementRepository {
  async findById(id: string): Promise<PatternMeasurement | null> {
    return PatternMeasurement.findByPk(id, {
      include: [{ model: MeasurementType, as: "measurementType" }],
    });
  }

  async findByPatternId(patternId: string): Promise<PatternMeasurement[]> {
    return PatternMeasurement.findAll({
      where: { patternId },
      include: [{ model: MeasurementType, as: "measurementType" }],
      order: [[{ model: MeasurementType, as: "measurementType" }, "displayOrder", "ASC"]],
    });
  }

  async findByPatternAndType(patternId: string, measurementTypeId: string): Promise<PatternMeasurement | null> {
    return PatternMeasurement.findOne({
      where: { patternId, measurementTypeId },
      include: [{ model: MeasurementType, as: "measurementType" }],
    });
  }

  async create(data: PatternMeasurementCreationAttributes): Promise<PatternMeasurement> {
    const measurement = await PatternMeasurement.create(data);
    return this.findById(measurement.id) as Promise<PatternMeasurement>;
  }

  async update(id: string, data: Partial<PatternMeasurement>): Promise<PatternMeasurement> {
    const measurement = await this.findById(id);
    if (!measurement) {
      throw new NotFoundError("PatternMeasurement");
    }
    await measurement.update(data);
    return this.findById(id) as Promise<PatternMeasurement>;
  }

  async delete(id: string): Promise<void> {
    const measurement = await this.findById(id);
    if (!measurement) {
      throw new NotFoundError("PatternMeasurement");
    }
    await measurement.destroy();
  }

  async deleteByPatternId(patternId: string): Promise<void> {
    await PatternMeasurement.destroy({ where: { patternId } });
  }

  async bulkUpsert(patternId: string, measurements: PatternMeasurementCreationAttributes[]): Promise<PatternMeasurement[]> {
    const results: PatternMeasurement[] = [];
    
    for (const measurementData of measurements) {
      const existing = await this.findByPatternAndType(patternId, measurementData.measurementTypeId);
      
      if (existing) {
        const updated = await this.update(existing.id, measurementData);
        results.push(updated);
      } else {
        const created = await this.create({ ...measurementData, patternId });
        results.push(created);
      }
    }
    
    return results;
  }
}
