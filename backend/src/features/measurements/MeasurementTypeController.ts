import { Request, Response } from "express";
import { MeasurementTypeService } from "./MeasurementTypeService";
import { MeasurementTypeCreateDTO, MeasurementTypeUpdateDTO, MeasurementCategory } from "@schnittmuster/dtos";
import { AuthenticatedRequest } from "@middleware/auth";

export class MeasurementTypeController {
  constructor(private readonly measurementTypeService = new MeasurementTypeService()) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const request = req as AuthenticatedRequest;
    const userId = request.user!.id;
    const category = request.query.category as MeasurementCategory | undefined;

    const measurementTypes = category
      ? await this.measurementTypeService.listByCategory(category, userId)
      : await this.measurementTypeService.list(userId);

    res.json({ data: measurementTypes });
  };

  listSystemDefaults = async (req: Request, res: Response): Promise<void> => {
    const measurementTypes = await this.measurementTypeService.listSystemDefaults();
    res.json({ data: measurementTypes });
  };

  listUserCustom = async (req: Request, res: Response): Promise<void> => {
    const request = req as AuthenticatedRequest;
    const userId = request.user!.id;
    const measurementTypes = await this.measurementTypeService.listUserCustom(userId);
    res.json({ data: measurementTypes });
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const request = req as AuthenticatedRequest;
    const userId = request.user!.id;
    const { id } = request.params;

    const measurementType = await this.measurementTypeService.get(id, userId);
    res.json({ data: measurementType });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const request = req as AuthenticatedRequest;
    const userId = request.user!.id;
    const payload: MeasurementTypeCreateDTO = request.body;

    const measurementType = await this.measurementTypeService.create(userId, payload);
    res.status(201).json({ data: measurementType });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const request = req as AuthenticatedRequest;
    const userId = request.user!.id;
    const { id } = request.params;
    const payload: MeasurementTypeUpdateDTO = request.body;

    const measurementType = await this.measurementTypeService.update(id, userId, payload);
    res.json({ data: measurementType });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const request = req as AuthenticatedRequest;
    const userId = request.user!.id;
    const { id } = request.params;

    await this.measurementTypeService.delete(id, userId);
    res.status(204).send();
  };
}
