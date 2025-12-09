import { Readable } from "stream";
import { fileTypeFromBuffer } from "file-type";
import { Pattern } from "@infrastructure/database/models/Pattern";
import { PatternRepository } from "@infrastructure/database/repositories/PatternRepository";
import { StorageFactory } from "@infrastructure/storage/StorageFactory";
import { IFileStorage } from "@infrastructure/storage/FileStorageService";
import { AccessControlService } from "@features/access-control/AccessControlService";
import { NotFoundError } from "@shared/errors";

export interface FileStreamResult {
  stream: Readable;
  mimeType: string;
  fileName: string;
}

export class FileService {
  private readonly storage: IFileStorage;

  constructor(
    private readonly patternRepository = new PatternRepository(),
    private readonly accessControlService = new AccessControlService()
  ) {
    this.storage = StorageFactory.create();
  }

  async streamPatternFile(userId: string, fileIdentifier: string): Promise<FileStreamResult> {
    const pattern = await this.patternRepository.findByFileIdentifier(fileIdentifier);
    if (!pattern) {
      throw new NotFoundError("File");
    }

    await this.assertAccess(pattern, userId);

    const buffer = await this.downloadOrThrow(fileIdentifier);
    const detectedType = await fileTypeFromBuffer(buffer);
    const mimeType = detectedType?.mime ?? "application/octet-stream";
    const fileName = this.buildFileName(pattern, detectedType?.ext);

    return {
      stream: Readable.from(buffer),
      mimeType,
      fileName,
    };  
  }

  private async assertAccess(pattern: Pattern, userId: string): Promise<void> {
    const resource = await this.accessControlService.ensureResource("pattern", pattern.id, pattern.userId);
    await this.accessControlService.assertHasRights(userId, resource.id, ["read"]);
  }

  private async downloadOrThrow(fileIdentifier: string): Promise<Buffer> {
    try {
      return await this.storage.download(fileIdentifier);
    } catch (error) {
      if (error instanceof Error && /not found/i.test(error.message)) {
        throw new NotFoundError("File");
      }
      throw error;
    }
  }

  private buildFileName(pattern: Pattern, extension?: string): string {
    const safeName = pattern.name.replace(/[^a-z0-9-_]+/gi, "_");
    if (extension) {
      return `${safeName}.${extension}`;
    }
    return safeName;
  }
}
