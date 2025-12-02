import { Request, Response } from "express";
import { TagService } from "./TagService";
import { asyncHandler } from "@middleware/errorHandler";

export class TagController {
  constructor(private readonly tagService = new TagService()) {}

  list = asyncHandler(async (_req: Request, res: Response) => {
    const tags = await this.tagService.list();
    res.json({ success: true, data: tags });
  });

  listCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await this.tagService.listCategories();
    res.json({ success: true, data: categories });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const tag = await this.tagService.create(req.body);
    res.status(201).json({ success: true, data: tag });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const tag = await this.tagService.update(req.params.id, req.body);
    res.json({ success: true, data: tag });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await this.tagService.remove(req.params.id);
    res.status(204).send();
  });
}

export const tagController = new TagController();
