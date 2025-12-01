import { PatternRepository } from "@infrastructure/database/repositories/PatternRepository";
import { PatternMapper } from "@shared/mappers";
import { PatternCreateDTO, PatternDTO, PatternUpdateDTO } from "@shared/dtos";
import { PaginatedResult } from "@shared/types";
import { validatePagination } from "@config/pagination";
import { ForbiddenError, NotFoundError } from "@shared/errors";
import { StorageFactory } from "@infrastructure/storage/StorageFactory";
import { IFileStorage } from "@infrastructure/storage/FileStorageService";
import { Pattern, PatternCreationAttributes } from "@infrastructure/database/models/Pattern";

type UploadedFile = Express.Multer.File;

export class PatternService {
  private readonly storage: IFileStorage;

  constructor(private readonly patternRepository = new PatternRepository()) {
    this.storage = StorageFactory.create();
  }

  async list(userId: string, page?: number, pageSize?: number): Promise<PaginatedResult<PatternDTO>> {
    const { page: safePage, pageSize: safeSize } = validatePagination(page, pageSize);
    const result = await this.patternRepository.findAllPaginated(userId, safePage, safeSize);
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
    this.assertOwnership(pattern, userId);
    return PatternMapper.toDTOWithRelations(pattern);
  }

  async create(userId: string, payload: PatternCreateDTO, file?: UploadedFile): Promise<PatternDTO> {
    const { tagIds, ...rest } = payload;
    const data: PatternCreationAttributes = {
      userId,
      name: rest.name,
      description: rest.description ?? null,
    };

    if (file) {
      const metadata = await this.storage.upload(file.buffer, file.originalname, file.mimetype);
      Object.assign(data, {
        fileStorageId: metadata.id,
        filePath: metadata.url,
      });
    }

    const pattern = await this.patternRepository.create(data, tagIds);
    return PatternMapper.toDTO(pattern);
  }

  async update(
    patternId: string,
    userId: string,
    payload: PatternUpdateDTO,
    file?: UploadedFile
  ): Promise<PatternDTO> {
    const pattern = await this.patternRepository.findById(patternId);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    this.assertOwnership(pattern, userId);

    const { tagIds, ...rest } = payload;
    const data: Partial<Pattern> = { ...rest } as Partial<Pattern>;
    if (file) {
      if (pattern.fileStorageId) {
        await this.storage.delete(pattern.fileStorageId);
      }
      const metadata = await this.storage.upload(file.buffer, file.originalname, file.mimetype);
      data.fileStorageId = metadata.id;
      data.filePath = metadata.url;
    }

    const updated = await this.patternRepository.update(patternId, data, tagIds);
    return PatternMapper.toDTO(updated);
  }

  async remove(patternId: string, userId: string): Promise<void> {
    const pattern = await this.patternRepository.findById(patternId);
    if (!pattern) {
      throw new NotFoundError("Pattern");
    }
    this.assertOwnership(pattern, userId);
    if (pattern.fileStorageId) {
      await this.storage.delete(pattern.fileStorageId);
    }
    await this.patternRepository.delete(patternId);
  }

  private assertOwnership(pattern: Pattern, userId: string): void {
    if (pattern.userId !== userId) {
      throw new ForbiddenError("You do not have access to this pattern");
    }
  }
}
