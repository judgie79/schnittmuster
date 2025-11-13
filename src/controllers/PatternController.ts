import { Request, Response } from "express";
import { PatternService } from "../services/PatternService";
import { asyncHandler } from "../middleware/errorHandler";

export class PatternController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const pattern = await PatternService.createPattern(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Schnittmuster erfolgreich erstellt",
      data: pattern,
    });
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await PatternService.getAllPatterns(userId, limit, offset);

    res.json({
      success: true,
      data: result.patterns,
      pagination: {
        total: result.total,
        limit,
        offset,
      },
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const pattern = await PatternService.getPattern(parseInt(id), userId);

    res.json({
      success: true,
      data: pattern,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const pattern = await PatternService.updatePattern(parseInt(id), userId, req.body);

    res.json({
      success: true,
      message: "Schnittmuster aktualisiert",
      data: pattern,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    await PatternService.deletePattern(parseInt(id), userId);

    res.json({
      success: true,
      message: "Schnittmuster gelöscht",
    });
  });

  static addTags = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { tag_ids } = req.body;

    await PatternService.addTagsToPattern(parseInt(id), userId, tag_ids);

    res.json({
      success: true,
      message: "Tags hinzugefügt",
    });
  });

  static removeTag = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id, tagId } = req.params;

    await PatternService.removeTagFromPattern(parseInt(id), userId, parseInt(tagId));

    res.json({
      success: true,
      message: "Tag entfernt",
    });
  });

  static search = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { tags, operator } = req.query;

    const tagIds = (tags as string)?.split(",").map(Number) || [];
    const patterns = await PatternService.searchPatterns(userId, tagIds, (operator as string) || "AND");

    res.json({
      success: true,
      data: patterns,
    });
  });
}
