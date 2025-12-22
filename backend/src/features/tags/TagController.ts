import { Request, Response } from "express";
import { TagService } from "./TagService";
import { asyncHandler } from "@middleware/errorHandler";
import { AuthenticatedRequest } from "@middleware/auth";

export class TagController {
  constructor(private readonly tagService = new TagService()) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const tags = await this.tagService.list(request.user!.id);
    res.json({ success: true, data: tags });
  });

  listCategories = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const categories = await this.tagService.listCategories(request.user!.id);
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

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const category = await this.tagService.createCategory(request.user!.id, req.body);
    res.status(201).json({ success: true, data: category });
  });

  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const category = await this.tagService.updateCategory(req.params.id, request.user!.id, req.body);
    res.json({ success: true, data: category });
  });

  removeCategory = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    await this.tagService.removeCategory(req.params.id, request.user!.id);
    res.status(204).send();
  });
}

export const tagController = new TagController();
