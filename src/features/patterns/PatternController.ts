import { Request, Response } from "express";
import { PatternService } from "./PatternService";
import { asyncHandler } from "@middleware/errorHandler";
import { AuthenticatedRequest } from "@middleware/auth";

type UploadedFile = Express.Multer.File;

export class PatternController {
  constructor(private readonly patternService = new PatternService()) {}

  private parseTagIds(input: unknown): string[] | undefined {
    if (!input) {
      return undefined;
    }
    if (Array.isArray(input)) {
      return input.map(String);
    }
    if (typeof input === "string") {
      try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed.map(String) : [input];
      } catch {
        return [input];
      }
    }
    return undefined;
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const { page, pageSize } = request.query;
    const result = await this.patternService.list(
      request.user!.id,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined
    );
    res.json({ success: true, data: result.data, pagination: result.pagination });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const pattern = await this.patternService.get(request.params.id, request.user!.id);
    res.json({ success: true, data: pattern });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const tagIds = this.parseTagIds(request.body.tagIds);
    const payload = { ...request.body, tagIds };
    const pattern = await this.patternService.create(
      request.user!.id,
      payload,
      request.file as UploadedFile | undefined
    );
    res.status(201).json({ success: true, data: pattern });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const tagIds = this.parseTagIds(request.body.tagIds);
    const payload = { ...request.body, tagIds };
    const pattern = await this.patternService.update(
      request.params.id,
      request.user!.id,
      payload,
      request.file as UploadedFile | undefined
    );
    res.json({ success: true, data: pattern });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    await this.patternService.remove(request.params.id, request.user!.id);
    res.status(204).send();
  });
}

export const patternController = new PatternController();
