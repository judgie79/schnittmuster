import { Request, Response } from "express";
import { PatternMeasurementRepository } from "@infrastructure/database/repositories/PatternMeasurementRepository";
import { PatternRepository } from "@infrastructure/database/repositories/PatternRepository";
import { MeasurementMapper } from "@shared/mappers";
import { PatternMeasurementCreateDTO, PatternMeasurementUpdateDTO } from "@schnittmuster/dtos";
import { NotFoundError, ForbiddenError } from "@shared/errors";
import { AuthenticatedRequest } from "@middleware/auth";

export class PatternMeasurementController {
  constructor(
    private readonly patternMeasurementRepository = new PatternMeasurementRepository(),
    private readonly patternRepository = new PatternRepository()
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const request = req as AuthenticatedRequest;
    const userId = request.user!.id;
    const { patternId } = request.params;

    const pattern = await this.patternRepository.findById(patternId);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    if (pattern.userId !== userId) {
      throw new ForbiddenError("You don't have access to this pattern");
    }

    const measurements = await this.patternMeasurementRepository.findByPatternId(patternId);
    res.json({ data: MeasurementMapper.patternMeasurementToDTOList(measurements) });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const request = req as AuthenticatedRequest;
    const userId = request.user!.id;
    const { patternId } = request.params;
    const payload: PatternMeasurementCreateDTO = request.body;

    const pattern = await this.patternRepository.findById(patternId);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    if (pattern.userId !== userId) {
      throw new ForbiddenError("You don't have access to this pattern");
    }

    const measurement = await this.patternMeasurementRepository.create({
      patternId,
      measurementTypeId: payload.measurementTypeId,
      value: payload.value || null,
      notes: payload.notes || null,
      isRequired: payload.isRequired || false,
    });

    res.status(201).json({ data: MeasurementMapper.patternMeasurementToDTO(measurement) });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const request = req as AuthenticatedRequest;
    const userId = request.user!.id;
    const { patternId, measurementId } = request.params;
    const payload: PatternMeasurementUpdateDTO = request.body;

    const pattern = await this.patternRepository.findById(patternId);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    if (pattern.userId !== userId) {
      throw new ForbiddenError("You don't have access to this pattern");
    }

    const measurement = await this.patternMeasurementRepository.findById(measurementId);
    if (!measurement || measurement.patternId !== patternId) {
      throw new NotFoundError("PatternMeasurement");
    }

    const updated = await this.patternMeasurementRepository.update(measurementId, {
      value: payload.value !== undefined ? payload.value : measurement.value,
      notes: payload.notes !== undefined ? payload.notes || null : measurement.notes,
      isRequired: payload.isRequired !== undefined ? payload.isRequired : measurement.isRequired,
    });

    res.json({ data: MeasurementMapper.patternMeasurementToDTO(updated) });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const request = req as AuthenticatedRequest;
    const userId = request.user!.id;
    const { patternId, measurementId } = request.params;

    const pattern = await this.patternRepository.findById(patternId);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    if (pattern.userId !== userId) {
      throw new ForbiddenError("You don't have access to this pattern");
    }

    const measurement = await this.patternMeasurementRepository.findById(measurementId);
    if (!measurement || measurement.patternId !== patternId) {
      throw new NotFoundError("PatternMeasurement");
    }

    await this.patternMeasurementRepository.delete(measurementId);
    res.status(204).send();
  };
}
