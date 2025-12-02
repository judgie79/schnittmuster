import { Request, Response } from "express";
import { TagService } from "./TagService";
import { asyncHandler } from "@middleware/errorHandler";
import { AuthenticatedRequest } from "@middleware/auth";

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
    const request = req as AuthenticatedRequest;
    const tag = await this.tagService.create(request.user!.id, req.body);
    res.status(201).json({ success: true, data: tag });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const tag = await this.tagService.update(req.params.id, request.user!.id, req.body);
    res.json({ success: true, data: tag });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    await this.tagService.remove(req.params.id, request.user!.id);
    res.status(204).send();
  });
}

export const tagController = new TagController();
