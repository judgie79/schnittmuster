import { PatternRepository } from "@infrastructure/database/repositories/PatternRepository";
import { PatternMapper } from "@shared/mappers";
import { PatternCreateDTO, PatternDTO, PatternUpdateDTO, PatternStatus } from "@shared/dtos";
import { AccessRight } from "schnittmuster-manager-dtos";
import { PaginatedResult } from "@shared/types";
import { validatePagination } from "@config/pagination";
import { NotFoundError } from "@shared/errors";
import { StorageFactory } from "@infrastructure/storage/StorageFactory";
import { IFileStorage } from "@infrastructure/storage/FileStorageService";
import { Pattern, PatternCreationAttributes } from "@infrastructure/database/models/Pattern";
import { AccessControlService } from "@features/access-control/AccessControlService";
import { PatternListFilters } from "./types";
import { environment } from "@config/environment";
import { extractFileIdentifierFromPath } from "@shared/utils/files";

type UploadedFile = Express.Multer.File;

export class PatternService {
  private readonly storage: IFileStorage;
  private readonly persistFileReference: boolean;

  constructor(
    private readonly patternRepository = new PatternRepository(),
    private readonly accessControlService = new AccessControlService()
  ) {
    this.storage = StorageFactory.create();
    this.persistFileReference = environment.storage.type === "database";
  }

  async list(
    userId: string,
    page?: number,
    pageSize?: number,
    filters?: PatternListFilters
  ): Promise<PaginatedResult<PatternDTO>> {
    const { page: safePage, pageSize: safeSize } = validatePagination(page, pageSize);
    const result = await this.patternRepository.findAllPaginated(userId, safePage, safeSize, filters);
    return {
      data: PatternMapper.toDTOList(result.data),
      pagination: result.pagination,
    };
  }

  async get(patternId: string, userId: string): Promise<PatternDTO> {
    const pattern = await this.patternRepository.getWithTags(patternId);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    await this.assertPatternPermissions(pattern, userId, ["read"]);
    const dto = PatternMapper.toDTOWithRelations(pattern);
    if (dto.proposedTags) {
      dto.proposedTags = dto.proposedTags.filter(
        (proposal) => proposal.status === "approved" || proposal.proposedByUserId === userId
      );
    }
    return dto;
  }

  async create(
    userId: string,
    payload: PatternCreateDTO,
    file?: UploadedFile,
    thumbnail?: UploadedFile
  ): Promise<PatternDTO> {
    const { tagIds, status, isFavorite, name, description } = payload as PatternCreateDTO & { isFavorite?: boolean };
    const data: PatternCreationAttributes = {
      userId,
      name,
      description: description ?? null,
      status: (status as PatternStatus) ?? "draft",
      isFavorite: isFavorite ?? false,
    };

    if (file) {
      const metadata = await this.storage.upload(file.buffer, file.originalname, file.mimetype);
      Object.assign(data, {
        fileStorageId: this.persistFileReference ? metadata.id : null,
        filePath: metadata.url,
      });
    }

    if (thumbnail) {
      const metadata = await this.storage.upload(thumbnail.buffer, thumbnail.originalname, thumbnail.mimetype);
      data.thumbnailPath = metadata.url;
    }

    const pattern = await this.patternRepository.create(data, tagIds);
    await this.accessControlService.createResource({ id: pattern.id, type: "pattern", ownerId: userId, referenceId: pattern.id });
    return PatternMapper.toDTO(pattern);
  }

  async update(
    patternId: string,
    userId: string,
    payload: PatternUpdateDTO,
    file?: UploadedFile,
    thumbnail?: UploadedFile
  ): Promise<PatternDTO> {
    const pattern = await this.patternRepository.findById(patternId);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    await this.assertPatternPermissions(pattern, userId, ["write"]);

    const { tagIds, status, isFavorite, name, description } = payload;
    const data: Partial<Pattern> = {};
    if (typeof name !== "undefined") {
      data.name = name;
    }
    if (typeof description !== "undefined") {
      data.description = description ?? null;
    }
    if (typeof status !== "undefined") {
      data.status = status as PatternStatus;
    }
    if (typeof isFavorite !== "undefined") {
      data.isFavorite = isFavorite;
    }
    if (file) {
      const existingFileId = this.getStoredFileIdentifier(pattern);
      if (existingFileId) {
        await this.storage.delete(existingFileId);
      }
      const metadata = await this.storage.upload(file.buffer, file.originalname, file.mimetype);
      data.fileStorageId = this.persistFileReference ? metadata.id : null;
      data.filePath = metadata.url;
    }

    if (thumbnail) {
      const existingThumbnailId = extractFileIdentifierFromPath(pattern.thumbnailPath);
      if (existingThumbnailId) {
        await this.storage.delete(existingThumbnailId);
      }
      const metadata = await this.storage.upload(thumbnail.buffer, thumbnail.originalname, thumbnail.mimetype);
      data.thumbnailPath = metadata.url;
    }

    const updated = await this.patternRepository.update(patternId, data, tagIds);
    return PatternMapper.toDTO(updated);
  }

  async remove(patternId: string, userId: string): Promise<void> {
    const pattern = await this.patternRepository.findById(patternId);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    await this.assertPatternPermissions(pattern, userId, ["delete"]);
    const storedFileId = this.getStoredFileIdentifier(pattern);
    if (storedFileId) {
      await this.storage.delete(storedFileId);
    }
    await this.patternRepository.delete(patternId);
    await this.accessControlService.deleteResourcesByReference(pattern.id, "pattern");
  }

  private async assertPatternPermissions(pattern: Pattern, userId: string, rights: AccessRight[]): Promise<void> {
    const resourceId = await this.resolvePatternResourceId(pattern);
    await this.accessControlService.assertHasRights(userId, resourceId, rights);
  }

  private async resolvePatternResourceId(pattern: Pattern): Promise<string> {
    const resource = await this.accessControlService.ensureResource("pattern", pattern.id, pattern.userId);
    return resource.id;
  }

  private getStoredFileIdentifier(pattern: Pattern): string | undefined {
    if (pattern.fileStorageId) {
      return pattern.fileStorageId;
    }
    return extractFileIdentifierFromPath(pattern.filePath);
  }
}
