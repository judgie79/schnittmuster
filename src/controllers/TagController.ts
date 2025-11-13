import { Request, Response } from "express";
import { TagService } from "../services/TagService";
import { asyncHandler } from "../middleware/errorHandler";

export class TagController {
  static getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await TagService.getAllCategories();

    res.json({
      success: true,
      data: categories,
    });
  });

  static getCategoryWithTags = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const category = await TagService.getCategoryWithTags(parseInt(categoryId));

    res.json({
      success: true,
      data: category,
    });
  });

  static getTagsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const tags = await TagService.getTagsByCategory(parseInt(categoryId));

    res.json({
      success: true,
      data: tags,
    });
  });

  static getTag = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tag = await TagService.getTag(parseInt(id));

    res.json({
      success: true,
      data: tag,
    });
  });

  static createTag = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const { name, color_hex } = req.body;

    const tag = await TagService.createTag(parseInt(categoryId), name, color_hex);

    res.status(201).json({
      success: true,
      message: "Tag erstellt",
      data: tag,
    });
  });

  static deleteTag = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await TagService.deleteTag(parseInt(id));

    res.json({
      success: true,
      message: "Tag gelöscht",
    });
  });
}
