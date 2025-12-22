import { Request, Response } from "express";
import { PatternService } from "./PatternService";
import { asyncHandler } from "@middleware/errorHandler";
import { AuthenticatedRequest } from "@middleware/auth";
import type { PatternStatus } from "@shared/dtos";
import { PATTERN_STATUS_VALUES, type PatternListFilters } from "./types";

type UploadedFile = Express.Multer.File;
type UploadedFileMap = Record<string, UploadedFile[]>;

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

  private parseBoolean(input: unknown): boolean | undefined {
    if (typeof input === "boolean") {
      return input;
    }
    if (typeof input === "string") {
      if (input.toLowerCase() === "true") {
        return true;
      }
      if (input.toLowerCase() === "false") {
        return false;
      }
    }
    return undefined;
  }

  private parseStringArray(input: unknown): string[] {
    if (!input) {
      return [];
    }
    if (Array.isArray(input)) {
      return input.map(String).map((value) => value.trim()).filter(Boolean);
    }
    if (typeof input === "string") {
      if (!input.trim()) {
        return [];
      }
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          return parsed.map(String).map((value) => value.trim()).filter(Boolean);
        }
      } catch {
        // Ignore JSON parse errors and fallback to comma separated parsing
      }
      return input.split(",").map((entry) => entry.trim()).filter(Boolean);
    }
    return [];
  }

  private parseStatuses(input: unknown): PatternStatus[] | undefined {
    const values = this.parseStringArray(input).map((value) => value.toLowerCase());
    const statuses = values.filter((value): value is PatternStatus =>
      PATTERN_STATUS_VALUES.includes(value as PatternStatus)
    );
    return statuses.length ? statuses : undefined;
  }

  private extractUploadedFiles(req: Request): { file?: UploadedFile; thumbnail?: UploadedFile } {
    const files = (req as Request & { files?: UploadedFileMap }).files;
    if (!files) {
      return {};
    }
    const getFirst = (key: string) => (files[key] && files[key][0]) || undefined;
    return {
      file: getFirst("file"),
      thumbnail: getFirst("thumbnail"),
    };
  }

  private buildListFilters(query: Request["query"]): PatternListFilters {
    const params = query as Record<string, unknown>;
    const tagIds = this.parseTagIds(params.tagIds);
    const favoriteOnly = this.parseBoolean(params.favoriteOnly);
    const queryText = typeof params.query === "string" ? params.query.trim() : undefined;

    return {
      query: queryText?.length ? queryText : undefined,
      statuses: this.parseStatuses(params.status),
      favoriteOnly: favoriteOnly === true ? true : undefined,
      tagIds,
    };
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const { page, pageSize } = request.query;
    const filters = this.buildListFilters(request.query);
    const result = await this.patternService.list(
      request.user!.id,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
      filters
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
    const isFavorite = this.parseBoolean(request.body.isFavorite);
    const { file, thumbnail } = this.extractUploadedFiles(request);
    const payload = {
      ...request.body,
      tagIds,
      ...(typeof isFavorite === "boolean" ? { isFavorite } : {}),
    };
    const pattern = await this.patternService.create(
      request.user!.id,
      payload,
      file,
      thumbnail
    );
    res.status(201).json({ success: true, data: pattern });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const tagIds = this.parseTagIds(request.body.tagIds);
    const isFavorite = this.parseBoolean(request.body.isFavorite);
    const { file, thumbnail } = this.extractUploadedFiles(request);
    const payload = {
      ...request.body,
      tagIds,
      ...(typeof isFavorite === "boolean" ? { isFavorite } : {}),
    };
    const pattern = await this.patternService.update(
      request.params.id,
      request.user!.id,
      payload,
      file,
      thumbnail
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
