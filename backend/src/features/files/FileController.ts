import { Request, Response } from "express";
import { asyncHandler } from "@middleware/errorHandler";
import { AuthenticatedRequest } from "@middleware/auth";
import { FileService } from "./FileService";

export class FileController {
  constructor(private readonly fileService = new FileService()) {}

  getFile = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    const { identifier } = request.params;
    const result = await this.fileService.streamPatternFile(request.user!.id, identifier);

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(result.fileName)}"`);
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    if (request.method === "HEAD") {
      result.stream.destroy();
      res.status(200).end();
      return;
    }

    result.stream.on("error", (error) => {
      res.destroy(error);
    });

    result.stream.pipe(res);
  });
}

export const fileController = new FileController();
